import { useState, useEffect, SetStateAction, ChangeEvent } from "react";
import { ethers } from "ethers";
import ABI_SPS_BUSD from "../ABI_SPS_BUSD.json";
import ABI_FSPS_TOKEN from "../ABI_FSPS_TOKEN.json";
import ErrorMessage from "./ErrorMessage";
import TxList from "./TxList";
import Tx1List from "./Tx1List";
import Rock from "../images/rock.png";
import Paper from "../images/paper.png";
import Scissors from "../images/scissors.png";


declare let window: any
interface Props { providerUrl: string | undefined }

export default function SC_BUSD({ providerUrl }: Props) {
    const [txs, setTxs] = useState([]);
    const [txs1, setTxs1] = useState([]);
    const [error, setError] = useState<string | undefined | unknown>();
    const [CasinoBank, setCasinoBank] = useState<string | number>("_______");
    const [GameValue, setGameValue] = useState<number | string>("");
    const [approveValue, setApproveValue] = useState<number | string>("______");
    const [spendValue, setSpendValue] = useState<number | string>("");

    const SPS_BUSD_ADDRESS = "0x8F3efAb4480470F311c1974EE5fA97b0a993D238";
    const FSPS_TOKEN_ADDRESS = "0x277bf3B4aeA25936855b511efaAf3B2Db4c8DBDC";

    const handleDepositChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setGameValue(value);
    }
    const handleSpendChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setSpendValue(value);
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

    const handleCheckBank = async (e: { preventDefault: () => void; }) => {
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
                displayBalance();
            }
            if (providerUrl === "eip-1193:") {
                if (window.trustwallet.networkVersion !== 97) {
                    ChNet();
                    return
                }
                displayBalance();
            }


        } catch (error) {
            setError(error);
            document.documentElement.scrollTop = 0;
        }
    };

    const displayBalance = async () => {
        if (providerUrl === "metamask") {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const SPS_BNB = new ethers.Contract(SPS_BUSD_ADDRESS, ABI_SPS_BUSD, provider);
            const CB = await SPS_BNB.bank();
            const CB_format = ethers.utils.formatEther(CB);
            setCasinoBank(CB_format);
        }
        if (providerUrl === "eip-1193:") {
            // const provider = new ethers.providers.Web3Provider(window.trustwallet);
            const provider = new ethers.providers.JsonRpcProvider("https://bsc-testnet.public.blastapi.io");
            const SPS_BNB = new ethers.Contract(SPS_BUSD_ADDRESS, ABI_SPS_BUSD, provider);
            const CB = await SPS_BNB.bank();
            const CB_format = ethers.utils.formatEther(CB);
            setCasinoBank(CB_format);
        }
    }

    useEffect(() => {
        if (!window.ethereum) {
            return
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const SPS_BNB = new ethers.Contract(SPS_BUSD_ADDRESS, ABI_SPS_BUSD, provider);
        SPS_BNB.on("gameStart", handleGameStart)

        return () => {
            SPS_BNB.removeAllListeners("gameStart");
            setTxs([]);
        };
    }, []);

    useEffect(() => {
        if (!window.ethereum) {
            return
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const SPS_BNB = new ethers.Contract(SPS_BUSD_ADDRESS, ABI_SPS_BUSD, provider);
        SPS_BNB.on("gameEnd", handleGameEnd)

        return () => {
            SPS_BNB.removeAllListeners("gameEnd");
            setTxs1([]);
        };
    }, []);

    const handleGameStart = (gameNumb: { toString: () => any; }, gameValue: { toString: () => any; }, event: { transactionHash: any; }) => {
        //@ts-ignore
        setTxs((prev) => [
            {
                gameNumb: gameNumb.toString(),
                gameValue: ethers.utils.formatEther(gameValue.toString()),
                txHash: event.transactionHash
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
        displayBalance();
    }

    const handleApprove = async (e: any) => {
        try {
            e.preventDefault();
            setError("");
            if (!window.ethereum) {
                document.documentElement.scrollTop = 0;
                throw new Error("Please install Metamask.");
            }
            if (window.ethereum.networkVersion !== "97") {
                ChNet();
                return
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const TOKEN = new ethers.Contract(FSPS_TOKEN_ADDRESS, ABI_FSPS_TOKEN, signer);
            //@ts-ignore
            if (spendValue < 0.001) {
                alert("Please approve more than 0.001 BUSD");
            }
            const ValueApproveTether = ethers.utils.parseEther(spendValue.toString());
            const Approve = await TOKEN.approve(SPS_BUSD_ADDRESS, ValueApproveTether);
            await Approve.wait();
            const AVtether = await TOKEN.allowance(signer.getAddress(), SPS_BUSD_ADDRESS);
            const AV = ethers.utils.formatEther(AVtether);
            setApproveValue(AV);
        } catch (err) {
            //   setError(err.message);
            console.log(err);
            document.documentElement.scrollTop = 0;
        }
    }

    const handleInfoApprove = async (e: React.MouseEvent<HTMLButtonElement>) => {
        try {
            e.preventDefault();
            setError("");
            if (!window.ethereum) {
                document.documentElement.scrollTop = 0;
                alert("Please install Metamask.");
            }
            if (window.ethereum.networkVersion !== "97") {
                ChNet();
                return
            }
            
            
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const Tether = new ethers.Contract(FSPS_TOKEN_ADDRESS, ABI_FSPS_TOKEN, signer);
            const AVtether = await Tether.allowance(signer.getAddress(), SPS_BUSD_ADDRESS);
            const AV = ethers.utils.formatEther(AVtether);
            setApproveValue(AV);
        } catch (err) {
            //   setError(err);
            console.log(err);
            document.documentElement.scrollTop = 0;
        }
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
                const SPS = new ethers.Contract(SPS_BUSD_ADDRESS, ABI_SPS_BUSD, signer);
                const GameValueParse = ethers.utils.parseEther((GameValue).toString());
                const start = await SPS.startGameSPS(GameValueParse, buttonValue);
                setGameValue("")
                await start.wait();
                displayBalance();
            }
            if (providerUrl === "eip-1193:") {
                if (window.trustwallet.networkVersion !== 97) {
                    ChNet();
                    return
                }
                const buttonValue = e.currentTarget.value;
                const provider = new ethers.providers.Web3Provider(window.trustwallet);
                // const provider = new ethers.providers.JsonRpcProvider("https://bsc-testnet.public.blastapi.io");
                await window.trustwallet.request({ method: "eth_requestAccounts" });
                const signer = provider.getSigner();
                console.log(provider);
                const SPS_BNB = new ethers.Contract(SPS_BUSD_ADDRESS, ABI_SPS_BUSD, signer);
                const GameValueParse = ethers.utils.parseEther((GameValue).toString());
                const start = await SPS_BNB.startGameSPS(buttonValue, { value: GameValueParse });
                setGameValue("")
                await start.wait();
                displayBalance();

            }
        } catch (error) {
            //@ts-ignore
            setError(error.message);
            //@ts-ignore
            console.log(error.message);
            setGameValue("")
            document.documentElement.scrollTop = 0;
        }
    };

    return (
        <div className="back_SC_BNB">
            <h3 className="first" >
                Contract: 0x8F3efAb4480470F311c1974EE5fA97b0a993D238 </h3>
            <div className="second">

                <p className="word p-4"> This site allows
                    you play in Rock, Paper, Scissors game with my smart contract in Binance testnet chain. My contract must contain balance of BUSD for game.
                    Check my balance, it displays below. If you win, you will receive double your bet minus a 10% Fee. Before you can place your bet you must give me
                    approve for yours BUSD. Dont't worry, you can revoke it - just paste 0 in approve field.</p>
            </div>
            <ErrorMessage message={error} />


            <div className="third">
                <div>
                    <div className="fours">
                        <div className="five">
                            <form >
                                <footer>
                                    <p className="">You must Approve spend BUSD </p>
                                    <input
                                        type="number"
                                        name="ValueApprove"
                                        className="input1"
                                        placeholder="BUSD to spend" onChange={handleSpendChange} value={spendValue} />

                                    <button
                                        onClick={handleApprove}
                                        type="button"
                                        className="button1">
                                        Approve
                                    </button>
                                </footer>

                                <div className="text-grey-900 my-1 left"><b>Your Approved funds {approveValue} BUSD</b>
                                    <p></p>
                                    <button
                                        type="button"
                                        onClick={handleInfoApprove}
                                        className="button1">
                                        check approved funds
                                    </button>

                                </div>

                            </form>
                        </div>
                    </div>

                    <div className="fours">
                        <div className="five">
                            <form onSubmit={handleCheckBank}>
                                <footer>
                                    <button
                                        type="submit"
                                        className="button1">
                                        check available game balance
                                    </button>
                                </footer>
                                <div className="text-grey-900 my-1 left"><b>Casino Bank {CasinoBank} BUSD</b>

                                    <div className="">You can't bet more than Casino Bank</div>
                                </div>
                                {/* </div> */}
                            </form>
                        </div>
                    </div>

                    <div className="fours">
                        <div className="five">
                            <div className="six">
                                ↓↓↓Game info↓↓↓Results Here↓↓↓Wait about 1 min↓↓↓
                            </div>
                            <div className="word ">
                                <TxList txs={txs} />
                                <Tx1List txs={txs1} />
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
                                        placeholder="bid value, min 0.001 BUSD" onChange={handleDepositChange} value={GameValue} />
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
                </div>
            </div>
        </div>
    )
}













