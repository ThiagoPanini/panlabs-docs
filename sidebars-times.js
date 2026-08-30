// @ts-check

/**
 * Sidebar for the `Times` tab, `times` instance: a single leaf standing in
 * until a real team writes its own docs, so no invented team names sit
 * here. No separator, same reason as `sidebars-procedimentos.js`: grouping
 * one leaf under a mute label is a frame with no picture, and level 1
 * measures the same indent the separator used to.
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  teams: [
    // The instance's only leaf. It carries `slug: /`, which is what makes
    // `/times` respond 200 with no redirect.
    {type: 'doc', id: 'work-in-progress', className: 'sidebar-icon sidebar-icon--work-in-progress'},
  ],
};

export default sidebars;
