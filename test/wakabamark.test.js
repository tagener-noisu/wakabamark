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
        const matcher = and(asterisk, asterisk, asterisk);

        expect(matcher("*hello")).toBe(null);
        expect(matcher("***hello")).toEqual([["*", "*", "*"], "hello"]);
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

        expect(matcher("hello")).toEqual(
            [{type: "string", children: "hello"}, ""]);

        expect(matcher("hel*lo")).toEqual(
            [{type: "string", children: "hel"}, "*lo"]);

        expect(matcher("*hel*lo")).toEqual(null);
    });
});

describe("strip", () => {
    it("joins result from the previous matcher", () => {
        const {plain_text, and, asterisk, strip} = wakabamark;
        const matcher = strip(and(asterisk, plain_text, asterisk));

        expect(matcher("*hello*")).toEqual(
            [{type: "string", children: "hello"}, ""]);
    });
});

describe("italic", () => {
    it("matches italic text", () => {
        const matcher = wakabamark.italic;

        expect(matcher("**hello**")).toEqual(null);

        expect(matcher("*hello*")).toEqual(
            [{type: "italic", children: [{type: "string", children: "hello"}]}, ""]);

        expect(matcher("_hello_")).toEqual(
            [{type: "italic", children: [{type: "string", children: "hello"}]}, ""]);
    });

    it("can contain bold", () => {
        const matcher = wakabamark.italic;

        expect(matcher("_hell**o**_")).toEqual(
            [{type: "italic",
                children: [
                    {type: "string", children: "hell"},
                    {type: "bold", children: [{type: "string", children: "o"}]}
                ]}, ""
            ]);
    });

    it("can contain monospace", () => {
        const matcher = wakabamark.italic;

        expect(matcher("_hell`o`_")).toEqual(
            [{type: "italic",
                children: [
                    {type: "string", children: "hell"},
                    {type: "mono", children: [{type: "string", children: "o"}]}
                ]}, ""
            ]);
    });
});

describe("bold", () => {
    it("matches bold text", () => {
        const matcher = wakabamark.bold;

        expect(matcher("*hello*")).toEqual(null);

        expect(matcher("**hello**")).toEqual(
            [{type: "bold", children: [{type: "string", children: "hello"}]}, ""]);

        expect(matcher("__hello__")).toEqual(
            [{type: "bold", children: [{type: "string", children: "hello"}]}, ""]);
    });

    it("can contain italic", () => {
        const matcher = wakabamark.bold;

        expect(matcher("**hell*o***")).toEqual(
            [{type: "bold",
                children: [
                    {type: "string", children: "hell"},
                    {type: "italic", children: [{type: "string", children: "o"}]}
                ]}, ""
            ]);
    });

    it("can contain monospace", () => {
        const matcher = wakabamark.bold;

        expect(matcher("__hell`o`__")).toEqual(
            [{type: "bold",
                children: [
                    {type: "string", children: "hell"},
                    {type: "mono", children: [{type: "string", children: "o"}]}
                ]}, ""
            ]);
    });
});

describe("monospace", () => {
    it("matches monospace text", () => {
        const matcher = wakabamark.monospace;

        expect(matcher("`hello`")).toEqual(
            [{type: "mono", children: [{type: "string", children: "hello"}]}, ""]);
    });
});
