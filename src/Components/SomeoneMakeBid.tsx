

interface Props { txs: any }

export default function SomeoneMakeBid({ txs }: Props) {
    if (txs.length === 0) return null;
    return (
        <>
            {txs.map((item: any) => (
                <div key={item.gameNumb} className="text-start alert-info mt-1 rounded-xl py-1 breakAll">
                    <div className="red">
                        Game number: {item.gameNumb} HEY! NEED REVEAL CHOICE!!!
                    </div>
                </div>
            ))}
        </>
    );
}

