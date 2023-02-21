

interface Props { txs: any }
export default function TxList({ txs }:Props) {
    if (txs.length === 0) return null;
    return (
      <>
        {txs.map((item:any) => (
          <div key={item.txHash} className="text-start alert-info mt-1 rounded-xl py-1">
              <div className="breakAll">Game number: {item.gameNumb}  GAME START!
              <div>Game value: {item.gameValue} BNB</div> </div>
              <a href={`https://testnet.bscscan.com/tx/${item.txHash}`}>
                Check in block explorer
              </a>
          </div>
        ))}
      </>
    );
  }
  






  // <div>
  //           {txs.map((log) => (
  //             <div className="flex flex-row">
  //               <div className="text-xs w-16 mr-2">
  //                 {log.type === "mint" && (
  //                   <span className="mr-2 bg-green-400 px-3">{log.type}</span>
  //                 )}
  //                 {log.type === "transfer" && (
  //                   <span className="mr-2 bg-yellow-400 px-3">{log.type}</span>
  //                 )}
  //               </div>
  //               {log.type === "transfer" && (
  //                 <div className="text-xs w-32">
  //                   {log.from.slice(0, 6)} ➡️ {log.to.slice(0, 6)}
  //                 </div>
  //               )}
  //               {log.type === "mint" && (
  //                 <div className="text-xs w-32">{log.to.slice(0, 6)}</div>
  //               )}
  //               <div className="text-xs w-32">
  //                 #{log.id} ({log.amount})
  //               </div>
  //             </div>
  //           ))}
  //         </div>