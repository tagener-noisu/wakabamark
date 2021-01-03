function pred_match(pred) {
    return (str) => {
        if (str.length === 0)
            return null;

        if (pred(str[0]))
            return [str[0], str.slice(1)];
        else
            return null;
    }
}

const char_match = (ch) => pred_match(x => x === ch);

const digit = pred_match(x => x >= "0" && x <= "9");

function not(matcher) {
    return (str) => {
        if (matcher(str) === null && str.length > 0)
            return [str[0], str.slice(1)];
        else
            return null;
    }
}

function and(...matchers) {
    return (str) => {
        const result = [];
        let rest = str;

        for (const matcher of matchers) {
            const match = matcher(rest);

            if (match === null)
                return null;

            result.push(match[0]);
            rest = match[1];
        }

        return [result, rest];
    }
}

function or(...matchers) {
    return (str) => {
        for(const matcher of matchers) {
            const match = matcher(str);

            if (match !== null)
                return match;
        }

        return null;
    }
}

function one_or_more(matcher) {
    return (str) => {
        let match = matcher(str);
        
        if (match === null)
            return null;

        const result = [match[0]];
        let rest = match[1];

        while (true) {
            match = matcher(rest);

            if (match == null)
                return [result, rest];

            result.push(match[0]);
            rest = match[1];
        }
    }
}

function join(matcher) {
    return (str) => {
        let match = matcher(str);

        if (match === null)
            return null;

        const result = match[0].reduce((acc, x) => {
            return acc + x;
        }, "");

        return [result, match[1]];
    }
}

function strip(matcher) {
    return (str) => {
        let match = matcher(str);

        if (match === null || match[0].length < 3)
            return null;

        return [match[0][1], match[1]];
    }
}

function number_of(matcher) {
    return (str) => {
        let match = matcher(str);

        if (match === null)
            return null;

        const number = Number(match[0]);
        if (isNaN(number))
            return null;

        return [number, match[1]];
    }
}

const asterisk = char_match("*");

const underscore = char_match("_");

const backtick = char_match("`");

const asterisk_or_underscore = or(asterisk, underscore);

const number = number_of(join(one_or_more(digit)));

function create_ast(type, matcher) {
    return (str) => {
        const result = matcher(str);

        if (result === null)
            return null;

        return [{type: type, children: result[0]}, result[1]];
    }
}

function tag_around(tags, contents) {
    return strip(and(tags, contents, tags));
}

const plain_text = create_ast("string",
    join(one_or_more(not(or(asterisk, underscore, backtick)))));

const italic = (str) => {
    const contents = one_or_more(or(plain_text, bold, monospace));
    const tags = asterisk_or_underscore;
    const matcher = create_ast("italic", tag_around(tags, contents));

    return matcher(str);
}

const bold = (str) => {
    const contents = one_or_more(or(plain_text, italic, monospace));
    const tags = and(asterisk_or_underscore, asterisk_or_underscore);
    const matcher = create_ast("bold", tag_around(tags, contents));

    return matcher(str);
}

const monospace = (str) => {
    const contents = one_or_more(plain_text);
    const tags = backtick;
    const matcher = create_ast("mono", tag_around(tags, contents));

    return matcher(str);
}

module.exports = {
    char_match,
    digit,
    not,
    and,
    or,
    one_or_more,
    join,
    strip,
    asterisk,
    underscore,
    backtick,
    number,
    plain_text,
    italic,
    bold,
    monospace,
}
