import AW from "./AW";

describe("AW", () =>
{
    it("should return a promise", async () =>
    {
        expect(AW(await Promise.resolve())).toBeInstanceOf(Promise);
    });
});