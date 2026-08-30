// @ts-check

/**
 * Sidebar for the `Procedimentos` tab, `procedimentos` instance: a single
 * leaf standing in until real procedures exist, so nothing invented sits
 * here for no one to maintain. No separator: grouping one leaf under a
 * mute label is a frame with no picture, and the leaf sits at level 1,
 * matching the 16px indent the separator used to (`chrome.css`).
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  procedures: [
    // The instance's only leaf. It carries `slug: /`, which is what makes
    // `/procedimentos` respond 200 with no redirect.
    {type: 'doc', id: 'work-in-progress', className: 'sidebar-icon sidebar-icon--work-in-progress'},
  ],
};

export default sidebars;
