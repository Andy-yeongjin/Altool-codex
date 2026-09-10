// Read-only DOM measurements. Pass this function to page.evaluate, or use the
// equivalent read-only in-app DOM observations. No screenshot or state mutation.
export function collectUiMeasurements(contracts) {
  return contracts.map(contract => {
    const nodes = [...document.querySelectorAll(contract.selector)];
    const visibleCount = nodes.filter(node => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && getComputedStyle(node).visibility === 'visible';
    }).length;
    const result = {id: contract.id, viewport: {width: innerWidth, height: innerHeight}, count: nodes.length, visibleCount};
    if (!nodes.length) return result;
    const element = nodes[0];
    const style = getComputedStyle(element);
    if (contract.kind === 'style') {
      result.styles = Object.fromEntries(Object.entries(contract.expected).map(([key, value]) => [key, typeof value === 'number' ? parseFloat(style[key]) : style[key]]));
    } else if (contract.kind === 'entry') {
      result.top = element.getBoundingClientRect().top + scrollY;
    } else if (contract.kind === 'text') {
      result.fontSizes = nodes.map(node => {
        const matrix = typeof node.getScreenCTM === 'function' ? node.getScreenCTM() : null;
        const scale = matrix ? Math.hypot(matrix.c, matrix.d) : 1;
        return parseFloat(getComputedStyle(node).fontSize) * scale;
      });
    } else if (contract.kind === 'icon') {
      result.src = element.getAttribute('src');
      result.transform = style.transform;
    }
    return result;
  });
}

// Product-owned completion comparator; company tooling only re-exports it.
export {checkUiMeasurements} from '../../altool/scripts/ui-contracts.mjs';
