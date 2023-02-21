
interface Props { txs: any }

export default function GameEnd({ txs }:Props) {
    if (txs.length === 0) return null;
    return (
      <>
        {txs.map((item: any) => (<div key={item.gameNumb} className="text-start alert-info mt-1 rounded-xl py-1 breakAll">
            <div>
              <div>Game number: {item.gameNumb} GAME END!
              <div className="red">Winner: {item.winner}</div></div>
            </div>
          </div>
        ))}
      </>
    );
  }
  