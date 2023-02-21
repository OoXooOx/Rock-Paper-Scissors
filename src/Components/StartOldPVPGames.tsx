

interface Props { txs: any }
export default function StartOldPVPGames({ txs }: Props) {

    const  formatUnixTimestamp = (unixTimestamp: number): string => {
      const date = new Date(unixTimestamp * 1000);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    console.log(txs);
    

  if (txs.length === 0) return null;
  return (
    <>
      {txs.map((item: any) => (
        <div key={item.transactionHash} className="text-start alert-info mt-1 rounded-xl py-1">
          <div className="breakAll">Game number: {item.gameNumber}  GAME START!
            <div>
              Game value: {item.gameValue} BNB
            </div>
            <div>
              Game start: {formatUnixTimestamp(item.startsAt)} 
            </div>
            <div>
              Game end: {formatUnixTimestamp(item.endsAt)} 
            </div>
          </div>
          <a href={`https://testnet.bscscan.com/tx/${item.transactionHash}`}>
            Check in block explorer
          </a>
        </div>
      ))}
      
    </>
  );
}

