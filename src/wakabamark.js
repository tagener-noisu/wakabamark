function char_match(ch) {
    return (str) => {
        if (str.length === 0)
            return null;

        if (str[0] == ch)
            return [str[0], str.slice(1)];
        else
            return null;
    }
}

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

const asterisk = char_match("*");

const underscore = char_match("_");

const backtick = char_match("`");

const plain_text =
    join(one_or_more(not(or(asterisk, underscore, backtick))));

const asterisk_or_underscore = or(asterisk, underscore);

const italic =
    strip(
        and(asterisk_or_underscore, plain_text, asterisk_or_underscore));

const bold =
    strip(and(
        join(and(asterisk_or_underscore, asterisk_or_underscore)),
        plain_text,
        join(and(asterisk_or_underscore, asterisk_or_underscore))));

const monospace =
    strip(and(backtick, plain_text, backtick));

module.exports = {
    char_match,
    not,
    and,
    or,
    one_or_more,
    join,
    strip,
    asterisk,
    underscore,
    backtick,
    plain_text,
    italic,
    bold,
    monospace,
}
