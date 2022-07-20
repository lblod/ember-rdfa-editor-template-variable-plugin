export default class InsertAndCollapseCommand {
  name = 'insert-and-collapse';

  arguments = ['htmlString', 'node'];

  canExecute() {
    return true;
  }

  execute({ transaction }, { htmlString, node }) {
    const range = transaction.rangeFactory.fromInNode(
      node,
      0,
      node.getMaxOffset()
    );
    transaction.executeCommand('insert-html', { htmlString, range });

    transaction.selectRange(
      transaction.currentSelection.lastRange.shrinkToVisible()
    );
    const containedNodes =
      transaction.currentSelection.lastRange.contextNodes('rangeTouches');
    containedNodes.next();
    const span = containedNodes.next().value;
    const finalRange = transaction.rangeFactory.fromInNode(span);
    transaction.selectRange(finalRange);
  }
}
