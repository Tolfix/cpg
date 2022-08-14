import "./Map.mod";

describe('map mod', () =>
{
    it('should return an array', () =>
    {
        const map = new Map<string, string>();
        map.set("a", "b");
        expect(map.array()).toEqual(["b"]);
    })
})