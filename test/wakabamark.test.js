const wakabamark = require("../src/wakabamark.js");

describe("char_match", () => {
    it("returns null when there's no match", () => {
        const matcher = wakabamark.char_match("$");

        expect(matcher("hello")).toBe(null);
    });

    it("returns null when string is empty", () => {
        const matcher = wakabamark.char_match("$");

        expect(matcher("")).toBe(null);
    });

    it("it returns matched asterisk and the rest of the string", () => {
        const matcher = wakabamark.char_match("$");

        expect(matcher("$hello")).toEqual(["$", "hello"]);
    });

    it("doesn't change the initial string", () => {
        const src = "$hello";
        const matcher = wakabamark.char_match("$");

        matcher(src);

        expect(src).toEqual("$hello");
    });
});

describe("not", () => {
    it("negates matcher", () => {
        const {char_match, not} = wakabamark;
        const matcher = not(char_match("*"));

        expect(matcher("")).toBe(null);
        expect(matcher("*hello")).toBe(null);
        expect(matcher("hello")).toEqual(["h", "ello"]);
    });
});

describe("and", () => {
    it("checks both matchers", () => {
        const {asterisk, and} = wakabamark;
        const matcher = and(asterisk, asterisk);

        expect(matcher("*hello")).toBe(null);
        expect(matcher("**hello")).toEqual([["*", "*"], "hello"]);
    });
});

describe("or", () => {
    it("matcher either of two matchers", () => {
        const {asterisk, underscore, or} = wakabamark;
        const matcher = or(asterisk, underscore);

        expect(matcher("hello")).toBe(null);
        expect(matcher("_hello")).toEqual(["_", "hello"]);
        expect(matcher("*_hello")).toEqual(["*", "_hello"]);
    });
});

describe("one_or_more", () => {
    it("matches one or more", () => {
        const {one_or_more, asterisk} = wakabamark;
        const matcher = one_or_more(asterisk);

        expect(matcher("hello")).toBe(null);
        expect(matcher("*hello")).toEqual([["*"], "hello"]);
        expect(matcher("***hello")).toEqual([["*", "*", "*"], "hello"]);
    });
});

describe("join", () => {
    it("joins result from the previous matcher", () => {
        const {join, one_or_more, asterisk} = wakabamark;
        const matcher = join(one_or_more(asterisk));

        expect(matcher("hello")).toBe(null);
        expect(matcher("***hello")).toEqual(["***", "hello"]);
    });
});

describe("plain text", () => {
    it("matches plain text", () => {
        const matcher = wakabamark.plain_text;

        expect(matcher("hello")).toEqual(["hello", ""]);
        expect(matcher("hel*lo")).toEqual(["hel", "*lo"]);
        expect(matcher("*hel*lo")).toEqual(null);
    });
});

describe("flatten", () => {
    it("flattens the result", () => {
        const {asterisk, and, flatten} = wakabamark;
        const matcher = flatten(and(asterisk, and(asterisk, asterisk)));

        expect(matcher("***")).toEqual([["*", "*", "*"], ""]);
    });
});

describe("strip", () => {
    it("joins result from the previous matcher", () => {
        const {plain_text, and, asterisk, strip, flatten} = wakabamark;
        const matcher = strip(
            flatten(and(asterisk, and(plain_text, asterisk))));

        expect(matcher("*hello*")).toEqual(["hello", ""]);
    });
});

describe("italic", () => {
    it("matches italic text", () => {
        const matcher = wakabamark.italic;

        expect(matcher("*hello*")).toEqual(["hello", ""]);
        expect(matcher("_hello_")).toEqual(["hello", ""]);
        expect(matcher("**hello**")).toEqual(null);
    });
});

describe("bold", () => {
    it("matches bold text", () => {
        const matcher = wakabamark.bold;

        expect(matcher("**hello**")).toEqual(["hello", ""]);
        expect(matcher("__hello__")).toEqual(["hello", ""]);
        expect(matcher("*hello*")).toEqual(null);
    });
});

describe("monospace", () => {
    it("matches monospace text", () => {
        const matcher = wakabamark.monospace;

        expect(matcher("`hello`")).toEqual(["hello", ""]);
    });
});
