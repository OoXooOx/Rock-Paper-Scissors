import { useState, useEffect, ChangeEvent } from "react";
import { ethers } from "ethers";
import ABI_SPS_BNB from "../ABI_SPS_BNB.json";
import ErrorMessage from "./ErrorMessage";
import SomeoneMakeBid from "./SomeoneMakeBid";
import StartOldPVPGames from "./StartOldPVPGames";
import GameEnd from "./GameEnd";
import TxList2 from "./TxList2";
import TxList3 from "./TxList3";
import Rock from "../images/rock.png";
import Paper from "../images/paper.png";
import Scissors from "../images/scissors.png";


declare let window: any
interface Props { providerUrl: string | undefined }

export default function PVP_BNB({ providerUrl }: Props) {
    const [txs, setTxs] = useState([]);
    const [txs1, setTxs1] = useState([]);
    const [txs2, setTxs2] = useState([]);
    const [txs3, setTxs3] = useState([]);
    const [txs4, setTxs4] = useState([]);
    const [error, setError] = useState<string | undefined | unknown>();
    const [GameValue, setGameValue] = useState<number | string>("");
    const [gameNumber, setGameNumber] = useState<number | string>("");
    const [gameNumberReveal, setGameNumberReveal] = useState<number | string>("");
    const [gameNumberAbort, setGameNumberAbort] = useState<number | string>("");
    const [replyValue, setReplyValue] = useState<number | string>("");
    const [secret, setSecret] = useState<string>("");
    const [secretReveal, setSecretReveal] = useState<string>("");

    const SPS_BNB_ADDRESS = "0x2A6F40A452141C0d0917687837AE2b79B6d9797f";

    const handleDepositChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setGameValue(value);
    }
    const handleReplyChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setReplyValue(value);
    }
    const handleGNChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setGameNumber(value);
    }
    const handleGNRevealChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setGameNumberReveal(value);
    }
    const handleGNAbortChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setGameNumberAbort(value);
    }

    const handleSecretChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSecret(e.target.value);
    }
    const handleSecretRevealChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSecretReveal(e.target.value);
    }


    const ChNet = async () => {
        try {
            if (providerUrl === "metamask") {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x61' }],
                });
            }
            if (providerUrl === "eip-1193:") {
                await window.trustwallet.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x61' }],
                });
            }
        } catch (switchError: any) {
            console.log(switchError.message);
            document.documentElement.scrollTop = 0;
            if (switchError.code === 4902) {
                try {
                    if (providerUrl === "eip-1193:") {
                        await window.trustwallet.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: '0x61',
                                    chainName: 'BNB Smart Chain Test network',
                                    rpcUrls: ['https://bsc-testnet.public.blastapi.io'],
                                    nativeCurrency: {
                                        "symbol": "tBNB",
                                        "decimals": 18
                                    },
                                    blockExplorerUrls: ["https://explorer.binance.org/smart-testnet"]
                                },
                            ],
                        });
                    }
                    if (providerUrl === "metamask") {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: '0x61',
                                    chainName: 'BSC Tesnet',
                                    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
                                    nativeCurrency: {
                                        "symbol": "tBNB",
                                        "decimals": 18
                                    },
                                },
                            ],
                        });
                    }
                } catch (addError: any) {
                    alert(addError.message);
                    console.log(addError);
                }
            }
        }
    }

    useEffect(() => {
        if (!window.ethereum) {
            return
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const SPS_BNB = new ethers.Contract(SPS_BNB_ADDRESS, ABI_SPS_BNB, provider);
        SPS_BNB.on("gameStartPVP", handleGameStart)

        return () => {
            SPS_BNB.removeAllListeners("gameStartPVP");
            setTxs([]);
        };
    }, []);

    const handleTransferSingle = (gameNumber: any, startsAt: any, endsAt: any, gameValue: any, transactionHash: any) => {
        //@ts-ignore
        setTxs3((prev) => [
            {
                gameNumber: gameNumber,
                startsAt,
                endsAt,
                gameValue: ethers.utils.formatEther(gameValue.toString()),
                transactionHash: transactionHash
            },
            ...prev
        ]);
    };

    const handleEnd = (gameNumb: any, winner: any) => {
        //@ts-ignore
        setTxs4((prev) => [
            {
                gameNumb,
                winner,
            },
            ...prev
        ]);
    };

    useEffect(() => {
        const fetchOldEvents = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(SPS_BNB_ADDRESS, ABI_SPS_BNB, provider);
            const filterFrom = contract.filters.gameEnd(null, null);
            const blockNumber = await provider.getBlockNumber();
            const items = await contract.queryFilter(filterFrom, 27439558, blockNumber);

            items.forEach((item: any) => {
                handleEnd(
                    item.args[0].toString(),
                    item.args[1].toString()
                );
            });
        };

        fetchOldEvents();

        return () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(SPS_BNB_ADDRESS, ABI_SPS_BNB, provider);
            contract.removeAllListeners("gameEnd");
            setTxs4([]);
        };
    }, []);





    useEffect(() => {
        const fetchOldEvents = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(SPS_BNB_ADDRESS, ABI_SPS_BNB, provider);
            const filterFrom = contract.filters.gameStartPVP(null, null, null, null);
            const blockNumber = await provider.getBlockNumber();
            const items = await contract.queryFilter(filterFrom, 27439558, blockNumber);
            // console.log(items);

            items.forEach((item: any) => {
                handleTransferSingle(
                    item.args[0].toString(),
                    item.args[1],
                    item.args[2],
                    item.args[3],
                    item.transactionHash,
                );
            });
        };

        fetchOldEvents();

        return () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(SPS_BNB_ADDRESS, ABI_SPS_BNB, provider);
            contract.removeAllListeners("gameStartPVP");
            setTxs3([]);
        };
    }, []);

    useEffect(() => {
        if (!window.ethereum) {
            return
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const SPS_BNB = new ethers.Contract(SPS_BNB_ADDRESS, ABI_SPS_BNB, provider);
        SPS_BNB.on("SomeoneMakeBid", handleSomeoneMakeBid)

        return () => {
            SPS_BNB.removeAllListeners("SomeoneMakeBid");
            setTxs([]);
        };
    }, []);

    useEffect(() => {
        if (!window.ethereum) {
            return
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const SPS_BNB = new ethers.Contract(SPS_BNB_ADDRESS, ABI_SPS_BNB, provider);
        SPS_BNB.on("gameEnd", handleGameEnd)

        return () => {
            SPS_BNB.removeAllListeners("gameEnd");
            setTxs1([]);
        };
    }, []);

    const handleGameStart = (
        gameNumber: { toString: () => any; },
        startsAt: { toString: () => any; },
        endsAt: { toString: () => any; },
        gameValue: { toString: () => any; },
        event: { transactionHash: any; },
    ) => {
        //@ts-ignore
        setTxs((prev) => [
            {
                gameNumber: gameNumber.toString(),
                startsAt: startsAt.toString(),
                endsAt: endsAt.toString(),
                gameValue: ethers.utils.formatEther(gameValue.toString()),
                txHash: event.transactionHash
            }, ...prev
        ]);
    }

    const handleSomeoneMakeBid = (gameNumb: { toString: () => any; }) => {
        //@ts-ignore
        setTxs2((prev) => [
            {
                gameNumb: gameNumb.toString(),
            }, ...prev
        ]);
    }

    const handleGameEnd = (gameNumb: { toString: () => any; }, winner: any) => {
        //@ts-ignore
        setTxs1((prev) => [
            {
                gameNumb: gameNumb.toString(),
                winner
            }, ...prev
        ]);
    }



    const handleRoll = async (e: React.MouseEvent<HTMLButtonElement>) => {
        try {
            e.preventDefault();
            setError("");
            if (!window.ethereum && !window.trustwallet) {
                document.documentElement.scrollTop = 0;
                alert("Please install Metamask or Trust wallet");
                return
            }
            if (providerUrl === "metamask") {
                if (window.ethereum.networkVersion !== "97") {
                    ChNet();
                    return
                }
                const buttonValue = e.currentTarget.value;
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();
                const myBytes = ethers.utils.toUtf8Bytes(secret);
                const encodedMessage = ethers.utils.defaultAbiCoder.encode(
                    ["uint256", "bytes", "address"],
                    [buttonValue, myBytes, await signer.getAddress()]
                );
                const hash = ethers.utils.solidityKeccak256(
                    ["bytes"],
                    [encodedMessage]
                );
                const SPS = new ethers.Contract(SPS_BNB_ADDRESS, ABI_SPS_BNB, signer);
                const GameValueParse = ethers.utils.parseEther((GameValue).toString());
                await SPS.startPVPGameSPS(hash, { value: GameValueParse });
                setGameValue("")
                setSecret("")
            }
        } catch (error) {
            //@ts-ignore
            setError(error.message);
            //@ts-ignore
            console.log(error.message);
            setGameValue("")
            setSecret("")
            document.documentElement.scrollTop = 0;
        }
    };

    const handleMakeChoice = async (e: React.MouseEvent<HTMLButtonElement>) => {
        try {
            e.preventDefault();
            setError("");
            if (!window.ethereum && !window.trustwallet) {
                document.documentElement.scrollTop = 0;
                alert("Please install Metamask or Trust wallet");
                return
            }
            if (providerUrl === "metamask") {
                if (window.ethereum.networkVersion !== "97") {
                    ChNet();
                    return
                }
                const buttonValue = e.currentTarget.value;
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();
                const SPS = new ethers.Contract(SPS_BNB_ADDRESS, ABI_SPS_BNB, signer);
                const GameValueParse = ethers.utils.parseEther((replyValue).toString());
                await SPS.makeChoicePVP(gameNumber, buttonValue, { value: GameValueParse });
                setReplyValue("")
                setGameNumber("")
            }
        } catch (error) {
            //@ts-ignore
            setError(error.message);
            //@ts-ignore
            console.log(error.message);
            setReplyValue("")
            setGameNumber("")
            document.documentElement.scrollTop = 0;
        }



    };

    const handleRevealChoice = async (e: React.MouseEvent<HTMLButtonElement>) => {
        try {
            e.preventDefault();
            setError("");
            if (!window.ethereum && !window.trustwallet) {
                document.documentElement.scrollTop = 0;
                alert("Please install Metamask or Trust wallet");
                return
            }
            if (providerUrl === "metamask") {
                if (window.ethereum.networkVersion !== "97") {
                    ChNet();
                    return
                }
                const buttonValue = e.currentTarget.value;
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();
                const SPS = new ethers.Contract(SPS_BNB_ADDRESS, ABI_SPS_BNB, signer);
                await SPS.revealChoice(gameNumberReveal, buttonValue, secretReveal);
                setGameNumberReveal("")
                setSecretReveal("")
            }
        } catch (error) {
            //@ts-ignore
            setError(error.message);
            //@ts-ignore
            console.log(error.message);
            setGameNumberReveal("")
            setSecretReveal("")
            document.documentElement.scrollTop = 0;
        }
    }

    const handleAbortGame = async (e: { preventDefault: () => void; }) => {
        try {
            e.preventDefault();
            setError("");
            if (!window.ethereum && !window.trustwallet) {
                document.documentElement.scrollTop = 0;
                alert("Please install Metamask or Trust wallet");
                return
            }
            if (providerUrl === "metamask") {
                if (window.ethereum.networkVersion !== "97") {
                    ChNet();
                    return
                }
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();
                const SPS = new ethers.Contract(SPS_BNB_ADDRESS, ABI_SPS_BNB, signer);
                await SPS.abort(gameNumberAbort);
                setGameNumberAbort("")
            }
        } catch (error) {
            //@ts-ignore
            setError(error.message);
            //@ts-ignore
            console.log(error.message);
            setGameNumberAbort("")
            document.documentElement.scrollTop = 0;
        }
    }




    return (
        <div className="back_SC_BNB">
            <h3 className="first" >
                Contract: 0x2A6F40A452141C0d0917687837AE2b79B6d9797f </h3>
            <div className="second">

                <p className="word p-4"> This site allows
                    you play in Rock, Paper, Scissors game with another person in Binance testnet chain. When you make bid -
                    a half of payed funds goes for game and half for collateral. You must make choice and
                    paste some secret word. It wiil be necessary for reveal your choice. You must reveal choice after someone make bid.
                    If you don't do this after 3 hours you can loose all your money. After reveal choice you get collateral and if you win - x2 bid value bet minus a 10% Fee.
                    If you loose - you just receive your collateral back. If there are no opponents, you can withdraw funds after 10 minutes.
                    If you play with other gamer and he doesn't reveal choice after 3 hours - you can invoke abort game and take back all your money.
                </p>
            </div>
            <ErrorMessage message={error} />


            <div className="third">
                <div>
                    <div className="fours">
                        <div className="five">
                            <div className="six">
                                ↓↓↓Game info↓↓↓Results Here↓↓↓Wait about 1 min↓↓↓
                            </div>
                            <div className="word ">
                                <TxList2 txs={txs} />
                                <TxList3 txs={txs1} />
                                <SomeoneMakeBid txs={txs2} />
                                <StartOldPVPGames txs={txs3} />
                                <GameEnd txs={txs4} />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="fours">
                        <h1 className="first_">
                            Place your bet
                        </h1>
                        <div className="five_">
                            <form>
                                <div className="seven">
                                    <input
                                        type="number"
                                        name="bidValue"
                                        className="input1"
                                        placeholder="bid value in BNB"
                                        onChange={handleDepositChange}
                                        value={GameValue} />
                                    <input
                                        type="text"
                                        name="secret"
                                        className="input1"
                                        placeholder="secret word"
                                        onChange={handleSecretChange}
                                        value={secret} />
                                </div>
                                <footer>
                                    <button
                                        type="submit"
                                        value="0"
                                        onClick={handleRoll}
                                    >
                                        <img
                                            src={Rock}
                                            height="150"
                                            id="0"
                                            width="80"
                                            className="logo2"
                                            alt="Rock" />
                                    </button>
                                    <button
                                        type="submit"
                                        value="2"
                                        onClick={handleRoll}>
                                        <img
                                            src={Paper}
                                            height="150"
                                            width="90"
                                            className="logo2"
                                            alt="Paper" />
                                    </button>
                                    <button
                                        type="button"
                                        value="1"
                                        onClick={handleRoll}>
                                        <img
                                            src={Scissors}
                                            height="150"
                                            width="80"
                                            className="logo2"
                                            alt="Scissors" />
                                    </button>
                                </footer>
                            </form>
                        </div>
                    </div>
                    <div className="fours">
                        <h1 className="first_">
                            Make reply bet
                        </h1>
                        <div className="five_">
                            <form>
                                <div className="seven">
                                    <input
                                        type="number"
                                        name="replyValue"
                                        className="input1"
                                        placeholder="bid value in BNB"
                                        onChange={handleReplyChange}
                                        value={replyValue} />
                                    <input
                                        type="number"
                                        name="gameNumb"
                                        className="input1"
                                        placeholder="game number"
                                        onChange={handleGNChange}
                                        value={gameNumber} />
                                </div>
                                <footer>
                                    <button
                                        type="submit"
                                        value="0"
                                        onClick={handleMakeChoice}
                                    >
                                        <img
                                            src={Rock}
                                            height="150"
                                            id="0"
                                            width="80"
                                            className="logo2"
                                            alt="Rock" />
                                    </button>
                                    <button
                                        type="submit"
                                        value="2"
                                        onClick={handleMakeChoice}>
                                        <img
                                            src={Paper}
                                            height="150"
                                            width="90"
                                            className="logo2"
                                            alt="Paper" />
                                    </button>
                                    <button
                                        type="button"
                                        value="1"
                                        onClick={handleMakeChoice}>
                                        <img
                                            src={Scissors}
                                            height="150"
                                            width="80"
                                            className="logo2"
                                            alt="Scissors" />
                                    </button>
                                </footer>
                            </form>
                        </div>
                    </div>
                    <div className="fours">
                        <h1 className="first_">
                            Reveal choice
                        </h1>
                        <div className="five_">
                            <form>
                                <div className="seven">
                                    <input
                                        type="number"
                                        name="gameNumReveal"
                                        className="input1"
                                        placeholder="game number"
                                        onChange={handleGNRevealChange}
                                        value={gameNumberReveal} />
                                    <input
                                        type="text"
                                        name="secret_reveal"
                                        className="input1"
                                        placeholder="secret word"
                                        onChange={handleSecretRevealChange}
                                        value={secretReveal} />
                                </div>
                                <footer>
                                    <button
                                        type="submit"
                                        value="0"
                                        onClick={handleRevealChoice}>
                                        <img
                                            src={Rock}
                                            height="150"
                                            id="0"
                                            width="80"
                                            className="logo2"
                                            alt="Rock" />
                                    </button>
                                    <button
                                        type="submit"
                                        value="2"
                                        onClick={handleRevealChoice}>
                                        <img
                                            src={Paper}
                                            height="150"
                                            width="90"
                                            className="logo2"
                                            alt="Paper" />
                                    </button>
                                    <button
                                        type="button"
                                        value="1"
                                        onClick={handleRevealChoice}>
                                        <img
                                            src={Scissors}
                                            height="150"
                                            width="80"
                                            className="logo2"
                                            alt="Scissors" />
                                    </button>
                                </footer>
                            </form>
                        </div>
                    </div>
                    <div className="fours">
                        <h1 className="first_">
                            Abort game
                        </h1>
                        <div className="five_">
                            <form onSubmit={handleAbortGame}>
                                <div className="seven">
                                    <input
                                        type="number"
                                        name="gameNumAbort"
                                        className="input1"
                                        placeholder="game number"
                                        onChange={handleGNAbortChange}
                                        value={gameNumberAbort} />
                                </div>
                                <button
                                    type="submit"
                                    className="button1">
                                    Abort game
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}













