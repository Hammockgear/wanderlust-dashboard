export const PRICES = {
  hammock: { retail: 119.99, cogs: 84.61 },
  tarp: {
    Quest: { retail: 149.99, cogs: 61.92 },
    Journey: { retail: 199.99, cogs: 82.0 },
  },
  topQuilt: {
    "Burrow Slim": { retail: 299.99, cogs: 105.25 },
    "Burrow Standard": { retail: 324.99, cogs: 113.77 },
  },
  underQuilt: { retail: 304.99, cogs: 109.46 },
  accessories: [
    { name: "Ridgeline Organizer", retail: 19.99, cogs: 2.46 },
    { name: "Mesh Peak Pocket", retail: 5.99, cogs: 2.0 },
    { name: "Reflective Guy Line", retail: 4.0, cogs: 0.84 },
    { name: "Ultralight Daisy Chain (20ft)", retail: 30.0, cogs: 25.0 },
  ],
};

export const TARP_OPTIONS = ["Quest", "Journey"] as const;
export const QUILT_OPTIONS = ["Burrow Slim", "Burrow Standard"] as const;

export const ACCESSORY_TOTAL = PRICES.accessories.reduce(
  (acc, it) => ({ retail: acc.retail + it.retail, cogs: acc.cogs + it.cogs }),
  { retail: 0, cogs: 0 }
);
