import React from 'react';
// import Button from 'react-bootstrap/Button';
// import { goerli, useNetwork, useSwitchNetwork } from 'wagmi'



const Home: React.FC = () => {
    // const { chain } = useNetwork()
    // const { chains, error, isLoading, pendingChainId, switchNetwork } =
    //     useSwitchNetwork()
    return (
        <div>
            <h3>It's demo site for Rock, Paper, Scissors game.
                <br></br>
                You can free mint to yours address FSPS token 0x277bf3B4aeA25936855b511efaAf3B2Db4c8DBDC 
                in BNB testnet chain. It's deployed only
                for display interaction with ERC-20 tokens. 
            </h3>
            {/* {chain && <div>Connected to {chain.name}</div>}

            {
                <Button
                    variant="outline-secondary"
                    disabled={!switchNetwork || chain?.id=== goerli.id}
                    onClick={() => switchNetwork?.(goerli.id)}
                >
                    {goerli.name}
                    {isLoading && pendingChainId === goerli.id && ' (switching)'}
                </Button>
            }

            <div>{error && error.message}</div> */}


        </div>
    )
}

export default Home;
