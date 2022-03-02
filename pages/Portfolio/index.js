import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Main from '../../components/Main';
import PortfolioContainer from '../../components/containers/PortfolioContainer';
import PerformerContainer from '../../components/containers/PerformerContainer';
import { useDispatch, useSelector } from 'react-redux';
import { getAccountAssets, clearData } from '../../redux/reducers/external/playible/assets';
import { useConnectedWallet, useLCDClient } from '@terra-money/wallet-provider';
import LoadingPageDark from '../../components/loading/LoadingPageDark';
import Link from 'next/link';
import SquadPackComponent from '../../components/SquadPackComponent';
import Container from '../../components/containers/Container';
import Sorter from './components/Sorter';
import { ATHLETE, PACK } from '../../data/constants/contracts';
import { axiosInstance } from '../../utils/playible';

const packList = [
  {
    name: 'STARTER PACK',
    key: 'prem2',
    release: '2',
    price: '20 UST',
    image: '/images/packimages/StarterPack1.png',
  },
  {
    name: 'PREMIUM PACK',
    key: 'prem3',
    release: '3',
    price: '35 UST',
    image: '/images/packimages/StarterPack1.png',
  },
  {
    name: 'BASE PACK',
    key: 'base2',
    release: '2',
    price: '20 UST',
    image: '/images/packimages/StarterPack1.png',
  },
];

const Portfolio = () => {
  const [searchText, setSearchText] = useState('');
  const [displayMode, setDisplay] = useState(true);
  const [loading, setLoading] = useState(true);

  const { list: playerList, status } = useSelector((state) => state.assets);

  const dispatch = useDispatch();
  const connectedWallet = useConnectedWallet();
  const lcd = useLCDClient();
  const [sortedList, setSortedList] = useState([]);
  const [packs, setPacks] = useState([])

  const fetchPacks = async () => {
    if (connectedWallet) {
      const formData = { 
        all_tokens_info: {
          owner: connectedWallet.walletAddress
        }
      }
      const res = await lcd.wasm.contractQuery(PACK, formData)
      if (res && res.length > 0) {
        setPacks(res)
      }
    }
  }

  useEffect(() => {
    if (typeof connectedWallet !== 'undefined') {
      dispatch(getAccountAssets({ walletAddr: connectedWallet.walletAddress }));
      fetchPacks()
    }
  }, [dispatch, connectedWallet]);

  useEffect(() => {
    if (typeof playerList !== 'undefined') {
      setSortedList(playerList)
      setLoading(false)
    }
  }, [playerList]);

  return (
    <Container>
      <div className="flex flex-col w-full overflow-y-auto h-screen justify-center self-center md:pb-12">
        <Main color="indigo-white">
          {loading ? (
            <LoadingPageDark />
          ) : (
            <div className="flex flex-col w-full overflow-y-auto overflow-x-hidden h-screen self-center text-indigo-black">
              <div className="ml-6 flex flex-col md:flex-row md:justify-between">
                <PortfolioContainer title="SQUAD" textcolor="text-indigo-black" />
                <Sorter list={sortedList} setList={setSortedList} setSearchText={setSearchText} />
              </div>

              <div className="flex flex-col w-full">
                <div className="justify-center self-center w-full md:mt-4">
                  {displayMode ? (
                    <>
                      <div className="flex md:ml-4 font-bold ml-8 md:ml-0 font-monument">
                        <div className="mr-6 md:ml-8 border-b-8 pb-2 border-indigo-buttonblue">
                          ATHLETES
                        </div>

                        <div
                          className=""
                          onClick={() => {
                            setDisplay(false);
                          }}
                        >
                          PACKS
                        </div>
                      </div>
                      <hr className="opacity-50" />
                      <div className="grid grid-cols-2 md:grid-cols-4 mt-12">
                        {sortedList.length > 0 ? (
                          sortedList.map(function (player, i) {
                            const path = player.token_info.info.extension
                              return (
                                <Link
                                  href={{
                                    pathname: '/AssetDetails',
                                    query: { id: path.athlete_id, origin: 'portfolio' },
                                  }}
                                >
                                  <div className="mb-4" key={i}>
                                    <PerformerContainer
                                      AthleteName={path.name}
                                      AvgScore={player.fantasy_score}
                                      id={path.athlete_id}
                                      uri={player.token_info.info.token_uri}
                                      rarity={path.rarity}
                                      status="ingame"
                                    />
                                  </div>
                                </Link>
                              );
                          })
                        ) : (
                          <div>No assets in your portfolio</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex md:ml-4 font-bold ml-8 md:ml-0 font-monument">
                        <div
                          className="md:ml-8 mr-6"
                          onClick={() => {
                            setDisplay(true);
                          }}
                        >
                          ATHLETES
                        </div>

                        <div className="border-b-8 pb-2 border-indigo-buttonblue">PACKS</div>
                      </div>
                      <hr className="opacity-50" />
                      <div className="md:ml-16 grid grid-cols-0 md:grid-cols-4 mt-12 justify-center">
                        {packs.map((data, i) => {
                          const path = data.token_info.info.extension
                          return (
                            <div className="mb-4" key={i}>
                              <SquadPackComponent
                                imagesrc={null}
                                packName={path.sport}
                                releaseValue={path.release[1]}
                                link={`?token_id=${data.token_id}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </Main>
      </div>
    </Container>
  );
};
export default Portfolio;
