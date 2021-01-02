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
