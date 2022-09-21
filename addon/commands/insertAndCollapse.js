export default class InsertAndCollapseCommand {
  canExecute() {
    return true;
  }

  execute({ transaction }, { htmlString, node }) {
    const range = transaction.rangeFactory.fromInNode(
      node,
      0,
      node.getMaxOffset()
    );
    transaction.commands.insertHtml({ htmlString, range });

    console.log(transaction.currentSelection.lastRange);
    transaction.selectRange(
      transaction.currentSelection.lastRange.shrinkToVisible()
    );
    const containedNodes =
      transaction.currentSelection.lastRange.contextNodes('rangeIsInside');
    const span = containedNodes.next().value;
    const finalRange = transaction.rangeFactory.fromInNode(span);
    transaction.selectRange(finalRange);
  }
}
