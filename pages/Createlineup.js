import { useWallet, WalletStatus } from '@terra-money/wallet-provider';
// import Image from 'next/image';
import * as React from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import HeaderBack from '../components/HeaderBack';
import Navbar from '../components/Navbar';
import Main from '../components/Main';
import TitledContainer from '../components/TitledContainer';
import RoundedContainer from '../components/RoundedContainer';
import AthleteGrid from '../components/AthleteGrid';
import TokenGridCol2 from '../components/TokenGridCol2';
import TeamMemberContainer from '../components/TeamMemberContainer';
import PerformerContainer from '../components/PerformerContainer';
import GameResultContainer from '../components/GameResultContainer';
import RowContainer from '../components/RowContainer';
import HorizontalScrollContainer from '../components/HorizontalScrollContainer';
import HorizontalContainer from '../components/HorizontalContainer';
import PackContainer from '../components/PackContainer';
// import fantasyLogo from '../public/fantasyinvestar.png';
// import daily from '../public/daily.png';
// import weekly from '../public/weekly.png';
// import seasonal from '../public/seasonal.png';
// import wallet from '../public/wallet.png';
import AthleteTokenContainer from '../components/AthleteTokenContainer';


export default function Home() {
    const { status, connect, disconnect, availableConnectTypes } = useWallet();

    const interactWallet = () => {
        if (status === WalletStatus.WALLET_CONNECTED) {
            disconnect();
        } else {
            connect(availableConnectTypes[1]);
        }
    };
    const animals = ['Dog', 'Bird', 'Cat', 'Mouse', 'Horse'];


    const playerList = [
        {
            name: 'STEPHEN CURRY',
            team: 'Golden State Warriors',
            id: '320',
            averageScore: '40',
            cost: '420 UST',
            jersey: '30',
            positions: ['PG', 'SG'],
            grad1: 'indigo-blue',
            grad2: 'indigo-bluegrad',
        },
        {
            name: 'LEBRON JAMES',
            team: 'Los Angeles Lakers',
            id: '25',
            averageScore: '25',
            cost: '840 UST',
            jersey: '23',
            positions: ['PG', 'SG'],
            grad1: 'indigo-purple',
            grad2: 'indigo-purplegrad',
        },
        {
            name: 'DEVIN BOOKER',
            team: 'Phoenix Suns',
            id: '16450',
            averageScore: '27',
            cost: '21 UST',
            jersey: '01',
            positions: ['SF', 'C'],
            grad1: 'indigo-darkblue',
            grad2: 'indigo-darkbluegrad',
        },
        {
            name: 'KEVIN DURANT',
            team: 'Brooklyn Nets',
            id: '12300',
            averageScore: '45',
            cost: '180 UST',
            jersey: '07',
            positions: ['PG'],
            grad1: 'indigo-black',
            grad2: 'indigo-red',
        },
        {
            name: 'BEN SIMMONS',
            team: 'Philadelphia 76ers',
            id: '21300',
            averageScore: '27',
            cost: '45.5 UST',
            jersey: '25',
            positions: ['SG', 'C'],
            grad1: 'indigo-blue',
            grad2: 'indigo-bluegrad',
        },

        // {
        //     name: '',
        //     team: '',
        //     id: '',
        //     cost: '',
        //     jersey: '',
        //     positions: [],
        //     grad1: '',
        //     grad2: '',
        // },
    ]





    const [isClosed, setClosed] = React.useState(true)






    return (
        <>

            <div className={`font-montserrat h-screen relative `}>





                <div className="flex flex-col w-full ">



                    <HeaderBack link="/Play" ></HeaderBack>





                    <Main color="indigo-dark">




                        <div className="flex flex-col  w-full h-full overflow-y-scroll overflow-x-hidden pb-5">
                            <TitledContainer title="CREATE LINEUP">

                                <div className="flex flex-col">

                                    <div className="font-thin text-xs mt-10 mb-10 "> create your own Fantasy Team</div>


                                    <TokenGridCol2>

                                        {playerList.map((player) => (
                                            <TeamMemberContainer rank={player.id} AthleteName={player.name} Averagescore={player.averageScore} />

                                        ))}
                                    </TokenGridCol2>

                                </div>

                            </TitledContainer>










                        </div>

                    </Main>

                </div>

            </div>
        </>
    );
}