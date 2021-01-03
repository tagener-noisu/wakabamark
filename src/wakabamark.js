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

const alpha = pred_match(x => x >= "A" && x <= "Z" || x >= "a" && x <= "z");

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

function if_match(matcher, fn) {
        return (str) => {
            let match = matcher(str);

            if (match === null)
                return null;
            else
                return [fn(match[0]), match[1]];
        }
}

const join = (matcher) =>
    if_match(matcher, (match) => 
        match.reduce((acc, x) => {
            return acc + x;
        }, "")
    );

const strip = (matcher, index = 1) =>
    if_match(matcher, (match) => match[index])

const number_of = (matcher) =>
    if_match(matcher, (match) => {
        const number = Number(match);

        if (isNaN(number))
            return null;

        return number;
    });

const create_ast = (type, matcher) =>
    if_match(matcher, (match) => ({type, children: match}));

function maybe(matcher) {
    return(str) => {
        let match = matcher(str);

        if (match === null)
            return [null, str];

        return match;
    }
}

function tag_around(tags, contents) {
    return strip(and(tags, contents, tags));
}

const asterisk = char_match("*");

const underscore = char_match("_");

const backtick = char_match("`");

const right_chevron = char_match(">");

const slash = char_match("/");

const percent = char_match("%");

const carriage_return = char_match("\r");

const new_line = char_match("\n");

const end_paragraph = and(carriage_return, new_line);

const asterisk_or_underscore = or(asterisk, underscore);

const number = number_of(join(one_or_more(digit)));

const plain_text = create_ast("string",
    join(one_or_more(not(or(
        asterisk, underscore, backtick, right_chevron, percent, end_paragraph)))));

const italic = (str) => {
    const contents = one_or_more(or(plain_text, bold, monospace, post_link));
    const tags = asterisk_or_underscore;
    const matcher = create_ast("italic", tag_around(tags, contents));

    return matcher(str);
}

const bold = (str) => {
    const contents = one_or_more(or(plain_text, italic, monospace, post_link));
    const tags = and(asterisk_or_underscore, asterisk_or_underscore);
    const matcher = create_ast("bold", tag_around(tags, contents));

    return matcher(str);
}

const monospace = (str) => {
    const contents = one_or_more(or(plain_text, bold, italic, post_link));
    const tags = backtick;
    const matcher = create_ast("mono", tag_around(tags, contents));

    return matcher(str);
}

const post_link = (() => {
    const board_name = strip(and(join(one_or_more(alpha)), slash), 0);
    const contents = or(and(board_name, number), number);

    return create_ast("post_link",
        strip(and(right_chevron, right_chevron, contents), 2))
})();

const spoiler = (str) => {
    const contents = one_or_more(or(
        plain_text, bold, italic, monospace, post_link, spoiler));
    const tag = and(percent, percent);
    const matcher = create_ast("spoiler", tag_around(tag, contents));

    return matcher(str);
}

const paragraph = (() => {
    const contents = one_or_more(or(
        plain_text, bold, italic, monospace, post_link, spoiler));

    return create_ast("paragraph",
        strip(and(contents, maybe(end_paragraph)), 0));
})();

const parse = one_or_more(paragraph);

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
    post_link,
    spoiler,
    paragraph,
    parse
}
