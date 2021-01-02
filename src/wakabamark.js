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

function and(m1, m2) {
    return (str) => {
        const match1 = m1(str);

        if (match1 === null)
            return null;

        const [result1, str1] = match1;
        const match2 = m2(str1);

        if (match2 === null)
            return null;

        const [result2, str2] = match2;
        return [[result1, result2], str2];
    }
}

function or(m1, m2) {
    return (str) => {
        const match1 = m1(str);

        if (match1 !== null)
            return match1;

        return m2(str);
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

function flatten(matcher) {
    return (str) => {
        let match = matcher(str);

        if (match === null)
            return null;

        return [match[0].flat(), match[1]];
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

const asterisk = char_match("*")

const underscore = char_match("_")

const plain_text = join(one_or_more(not(or(asterisk, underscore))));

const asterisk_or_underscore = or(asterisk, underscore);

const italic =
    strip(flatten(
        and(asterisk_or_underscore,
            and(plain_text, asterisk_or_underscore))));

module.exports = {
    char_match,
    not,
    and,
    or,
    one_or_more,
    join,
    flatten,
    strip,
    asterisk,
    underscore,
    plain_text,
    italic,
}
