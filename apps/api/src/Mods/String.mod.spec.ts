import "./String.mod";

describe('string mod', () =>
{
    it("first letter should be uppercase", () =>
    {
        const s = "abc";
        expect(s).toEqual("abc");
        expect(s.firstLetterUpperCase()).toEqual("Abc");
    });
});