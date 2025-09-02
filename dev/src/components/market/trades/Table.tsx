import { Table } from "react-bootstrap";

export function TradesTable({ trades }: any) {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Side</th>
          <th>Qty</th>
          <th>Entry</th>
          <th>Exit</th>
          <th>Status</th>
          <th>Opened</th>
          <th>Closed</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((t) => (
          <tr key={t.id}>
            <td>{t.symbol}</td>
            <td>{t.side}</td>
            <td>{t.qty}</td>
            <td>{t.entryPrice}</td>
            <td>{t.exitPrice ?? "-"}</td>
            <td>{t.status}</td>
            <td>{t.openedAt.toLocaleString()}</td>
            <td>{t.closedAt?.toLocaleString() ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default TradesTable
