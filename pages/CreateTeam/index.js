import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Main from '../../components/Main';
import PortfolioContainer from '../../components/containers/PortfolioContainer';
import Link from 'next/link';
import Container from '../../components/containers/Container';
import BackFunction from '../../components/buttons/BackFunction';

import { playList } from '../../pages/PlayDetails/data/index.js';

import { useRouter } from 'next/router';

import Lineup from '../../pages/CreateLineup/components/Lineup.js';

import Data from '../../data/teams.json';
import { useDispatch, useSelector } from 'react-redux';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import { getAccountAssets } from '../../redux/reducers/external/playible/assets';
import PerformerContainer from '../../components/containers/PerformerContainer';
import PerformerContainerSelectable from '../../components/containers/PerformerContainerSelectable';
import { CW721 } from '../../data/constants/contracts';
import BaseModal from '../../components/modals/BaseModal';
import { position } from '../../utils/athlete/position';
import Modal from '../../components/modals/Modal';
import { axiosInstance } from '../../utils/playible';

export default function CreateLineup() {
  const router = useRouter();
  const dispatch = useDispatch();
  const connectedWallet = useConnectedWallet();
  const athlete = {
    athlete_id: null,
    token_id: null,
    contract_addr: null,
  };
  const gameTeamFormat = {
    name: '',
    game: 0,
    wallet_addr: '',
    athletes: [],
  };
  const positions = ['P', 'P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'OF', 'OF'];
  const [team, setTeam] = useState([]);
  const [selectModal, setSelectModal] = useState(false);
  const [filterPos, setFilterPos] = useState(null);
  const [teamName, setTeamName] = useState('Team 1');

  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const limitOptions = [5, 10, 30, 50];
  const [athleteList, setAthleteList] = useState([]);
  const [chosenAthlete, setChosenAthlete] = useState(null);
  const [slotIndex, setSlotIndex] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [failedModal, setFailedModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editInput, setEditInput] = useState(teamName);
  const [createLoading, setCreateLoading] = useState(false);

  const { list: playerList } = useSelector((state) => state.assets);

  const changeIndex = (index) => {
    switch (index) {
      case 'next':
        setOffset(offset + 1);
        break;
      case 'previous':
        setOffset(offset - 1);
        break;
      case 'first':
        setOffset(0);
        break;
      case 'last':
        setOffset(pageCount - 1);
        break;

      default:
        break;
    }
  };

  const canNext = () => {
    if (offset + 1 === pageCount) {
      return false;
    } else {
      return true;
    }
  };

  const canPrevious = () => {
    if (offset === 0) {
      return false;
    } else {
      return true;
    }
  };

  const prepareSlots = () => {
    let slots = positions.map((item) => {
      return {
        ...athlete,
        position: item,
      };
    });

    setTeam(slots);
  };

  const filterAthletes = (list, pos) => {
    let tempList = [...list];

    if (tempList.length > 0 && pos) {
      let token_ids = team
        .map(({ athlete_id, token_id, contract_addr }) => {
          if (token_id) {
            return token_id;
          }
        })
        .filter((item) => item);
      let filteredList = tempList
        .filter((item) => {
          if (pos === 'P') {
            return (
              item.token_info.info.extension.position === 'RP' ||
              item.token_info.info.extension.position === 'SP'
            );
          } else if (pos === 'OF') {
            return (
              item.token_info.info.extension.position === 'LF' ||
              item.token_info.info.extension.position === 'CF'
            );
          } else {
            return item.token_info.info.extension.position === pos;
          }
        })
        .map((item) => {
          return {
            ...item,
            selected: false,
          };
        });
      if (token_ids.length > 0) {
        filteredList = filteredList.filter((item) => {
          return token_ids.indexOf(item.token_id) === -1;
        });
      }

      return filteredList;
    } else {
      return [];
    }
  };

  const updateTeamSlots = () => {
    let tempSlots = [...team];

    if (slotIndex !== null && chosenAthlete !== null) {
      const athleteInfo = {
        ...chosenAthlete,
        athlete_id: chosenAthlete.token_info.info.extension.athlete_id,
        contract_addr: CW721,
        position: chosenAthlete.token_info.info.extension.position,
      };
      tempSlots[slotIndex] = athleteInfo;

      setTeam(tempSlots);
    }
    setConfirmModal(false);
    setTimeout(() => {
      setSelectModal(false);
      setSlotIndex(null);
      setChosenAthlete(null);
      setFilterPos(null);
    }, 300);
  };

  const proceedChanges = () => {
    if (chosenAthlete) {
      setConfirmModal(true);
      setLimit(5);
      setOffset(0);
    } else {
      alert('Please choose an athlete for this position.');
    }
  };

  const hasEmptySlot = () => {
    let hasEmptySlot = false;

    team.forEach((item) => {
      if (!item.athlete_id) {
        hasEmptySlot = true;
      }
    });

    return hasEmptySlot;
  };

  const confirmTeam = async () => {
    setLimit(5);
    setOffset(0);
    if (connectedWallet) {
      setSubmitModal(false);

      if (!hasEmptySlot()) {
        setCreateLoading(true);
        const trimmedAthleteData = team.map(({ athlete_id, token_id, contract_addr }) => {
          return {
            athlete_id,
            token_id,
            contract_addr,
          };
        });

        const formData = {
          name: teamName,
          game: router.query.id,
          wallet_addr: connectedWallet.walletAddress,
          athletes: [...trimmedAthleteData],
        };

        const lock_team = {
          lock_team: {
            game_id: router.query.id,
            team_name: teamName,
            token_ids: [trimmedAthleteData.map((item) => item.token_id)],
          },
        };

        console.log('lock_team', lock_team);

        const res = await axiosInstance.post('/fantasy/game_team/', formData);
        setCreateLoading(false);
        if (res.status === 201) {
          setSuccessModal(true);
          router.replace(`/CreateLineup/?id=${router.query.id}`);
        } else {
          alert('An error occurred! Refresh the page and try again.');
        }
      } else {
        alert('You must fill up all the slots to proceed.');
      }
    } else {
      alert('Please connect your wallet first!');
    }
  };

  const filterAthleteByPos = (pos) => {
    if (playerList && playerList.tokens && playerList.tokens.length > 0) {
      if (pos) {
        setFilterPos(pos);
        const tempList = [...playerList.tokens];
        const filteredList = filterAthletes(tempList, pos).splice(limit * offset, limit);

        if (!(filteredList.length > 0)) {
          alert(`You currently do not own athlete(s) that have the position of ${pos}`);
        } else {
          setSelectModal(true);
          setAthleteList(filteredList);
          setPageCount(Math.ceil(filterAthletes(tempList, pos).length / limit));
        }
      } else {
        setSelectModal(false);
      }
    }
  };

  useEffect(() => {
    prepareSlots();
  }, []);

  useEffect(() => {
    if (dispatch && connectedWallet) {
      dispatch(getAccountAssets({ walletAddr: connectedWallet.walletAddress }));
    }
  }, [dispatch, connectedWallet]);

  useEffect(() => {
    if (playerList && playerList.tokens && playerList.tokens.length > 0) {
      if (filterPos) {
        const tempList = [...playerList.tokens];
        const filteredList = filterAthletes(tempList, filterPos).splice(limit * offset, limit);

        if (!(filteredList.length > 0)) {
          alert(`You currently do not own athlete(s) that have the position of ${filterPos}`);
        } else {
          setSelectModal(true);
          setAthleteList(filteredList);
          setPageCount(Math.ceil(filterAthletes(tempList, filterPos).length / limit));
        }
      } else {
        setSelectModal(false);
      }
    }
  }, [playerList, limit, offset]);

  if (!(router && router.query.id)) {
    return '';
  }

  return (
    <>
      <Container>
        <div className="flex flex-col w-full overflow-y-auto h-screen justify-center self-center md:pb-12">
          <Main color="indigo-white">
            {selectModal ? (
              <PortfolioContainer
                title={`SELECT YOUR ${
                  position('baseball', filterPos).toUpperCase() || 'No filtered'
                }`}
                textcolor="text-indigo-black"
              >
                <div className="grid grid-cols-2 gap-y-4 mt-4 md:grid-cols-4 md:ml-7 md:mt-12">
                  {athleteList.map((player, i) => {
                    const path = player.token_info.info.extension;
                    return (
                      <div className="mb-4" key={i}>
                        <PerformerContainerSelectable
                          AthleteName={path.name}
                          AvgScore={player.fantasy_score}
                          id={path.athlete_id}
                          uri={player.token_info.info.token_uri || player.nft_image}
                          rarity={path.rarity}
                          status="ingame"
                          index={i}
                          token_id={player.token_id}
                          selected={chosenAthlete}
                          selectorFunction={() => setChosenAthlete(player)}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between md:mt-5 md:mr-6 p-5">
                  <div className="bg-indigo-white mr-1 h-11 flex items-center font-thin border-indigo-lightgray border-opacity-40 p-2">
                    {pageCount > 1 && (
                      <button className="px-2 border mr-2" onClick={() => changeIndex('first')}>
                        First
                      </button>
                    )}
                    {pageCount !== 0 && canPrevious() && (
                      <button className="px-2 border mr-2" onClick={() => changeIndex('previous')}>
                        Previous
                      </button>
                    )}
                    <p className="mr-2">
                      Page {offset + 1} of {pageCount}
                    </p>
                    {pageCount !== 0 && canNext() && (
                      <button className="px-2 border mr-2" onClick={() => changeIndex('next')}>
                        Next
                      </button>
                    )}
                    {pageCount > 1 && (
                      <button className="px-2 border mr-2" onClick={() => changeIndex('last')}>
                        Last
                      </button>
                    )}
                  </div>
                  <div className="bg-indigo-white mr-1 h-11 w-64 flex font-thin border-2 border-indigo-lightgray border-opacity-40 p-2">
                    <select
                      value={limit}
                      className="bg-indigo-white text-lg w-full outline-none"
                      onChange={(e) => {
                        setLimit(e.target.value);
                        setOffset(0);
                      }}
                    >
                      {limitOptions.map((option) => (
                        <option value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex mt-10 bg-indigo-black bg-opacity-5 w-full justify-end">
                  <button
                    className="bg-indigo-buttonblue text-indigo-white w-5/6 md:w-80 h-14 text-center font-bold text-md"
                    onClick={proceedChanges}
                  >
                    PROCEED
                  </button>
                </div>
              </PortfolioContainer>
            ) : (
              <>
                <BackFunction prev={`/CreateLineup?id=${router.query.id}`} />
                <PortfolioContainer title="CREATE LINEUP" textcolor="text-indigo-black">
                  <div className="flex flex-col">
                    <div className="flex items-end pt-10 pb-3 ml-7">
                      <div className="font-monument text-xl">{teamName}</div>
                      <p
                        className="ml-5 underline text-sm pb-1 cursor-pointer"
                        onClick={() => setEditModal(true)}
                      >
                        EDIT TEAM NAME
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 mt-4 md:grid-cols-4 md:ml-7 md:mt-12">
                      {team.length > 0 &&
                        team.map((data, i) => {
                          return (
                            <div>
                              <Lineup
                                position={data.position}
                                player={data.token_info ? data.token_info.info.extension.name : ''}
                                score={data.score || 0}
                                onClick={() => {
                                  filterAthleteByPos(data.position);
                                  setSlotIndex(i);
                                }}
                                img={
                                  data.nft_image || data.token_info
                                    ? data.token_info.info.token_uri
                                    : null
                                }
                              />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  <div className="flex mt-10 bg-indigo-black bg-opacity-5 w-full justify-end">
                    <button
                      className="bg-indigo-buttonblue text-indigo-white w-full md:w-5/6 md:w-80 h-14 text-center font-bold text-md"
                      onClick={() => setSubmitModal(true)}
                    >
                      CONFIRM TEAM
                    </button>
                  </div>
                </PortfolioContainer>
              </>
            )}
          </Main>
        </div>
      </Container>
      <BaseModal
        title={'Confirm selection'}
        visible={confirmModal}
        onClose={() => setConfirmModal(false)}
      >
        {chosenAthlete ? (
          <div>
            <p>Are you sure to select {chosenAthlete.token_info.info.extension.name} ?</p>
            <button
              className="bg-indigo-green font-monument tracking-widest text-indigo-white w-full h-16 text-center text-sm mt-4"
              onClick={updateTeamSlots}
            >
              CONFIRM
            </button>
          </div>
        ) : (
          ''
        )}
      </BaseModal>
      {/* <BaseModal title={'Submit Team'} visible={submitModal} onClose={() => setSubmitModal(false)}>
        <div className="mt-5">
          <p>Confirm team lineup</p>
          <button
            className="bg-indigo-green font-monument tracking-widest text-indigo-white w-full h-16 text-center text-sm mt-4"
            onClick={() => setSubmitModal(false)}
          >
            CONFIRM
          </button>
          <button
            className="bg-red-pastel font-monument tracking-widest text-indigo-white w-full h-16 text-center text-sm mt-4"
            onClick={() => setSubmitModal(false)}
          >
            CANCEL
          </button>
        </div>
      </BaseModal> */}
      <Modal title={'Submit Team'} visible={submitModal} onClose={() => setSubmitModal(false)}>
        <div className="mt-2">
          <p className="">Confirm team lineup</p>
          <button
            className="bg-indigo-green font-monument tracking-widest text-indigo-white w-full h-16 text-center text-sm mt-4"
            onClick={confirmTeam}
          >
            CONFIRM
          </button>
          <button
            className="bg-red-pastel font-monument tracking-widest text-indigo-white w-full h-16 text-center text-sm mt-4"
            onClick={() => setSubmitModal(false)}
          >
            CANCEL
          </button>
        </div>
      </Modal>
      <Modal title={'LOADING'} visible={createLoading} onClose={() => console.log()}>
        <div>
          <p className="mb-5 text-center">Creating your team</p>
          <div className="flex gap-5 justify-center mb-5">
            <div className="bg-indigo-buttonblue animate-bounce w-5 h-5 rounded-full"></div>
            <div className="bg-indigo-buttonblue animate-bounce w-5 h-5 rounded-full"></div>
            <div className="bg-indigo-buttonblue animate-bounce w-5 h-5 rounded-full"></div>
          </div>
        </div>
      </Modal>
      <Modal title={'SUCCESS'} visible={successModal} onClose={() => console.log()}>
        <div className="mt-2">
          <p className="text-center font-montserrat mb-5">Team created successfully!</p>
        </div>
      </Modal>
      <Modal title={'FAILED'} visible={failedModal} onClose={() => setFailedModal(false)}>
        <div className="mt-2">
          <p className="text-center font-montserrat mb-5">An error occured. Please try again later.</p>
        </div>
      </Modal>
      <Modal title={'EDIT TEAM NAME'} visible={editModal} onClose={() => setEditModal(false)}>
        <div className="mt-2 px-5">
          <p className="text-xs uppercase font-thin mb-2" style={{ fontFamily: 'Montserrat' }}>
            EDIT TEAM NAME
          </p>
          <input
            className="border p-2 w-full"
            placeholder={teamName}
            style={{ fontFamily: 'Montserrat' }}
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
          />
          <div className="flex mt-16 mb-5 bg-opacity-5 w-full">
            <button
              className="bg-indigo-buttonblue text-indigo-white w-full h-14 text-center font-bold text-md"
              onClick={() => {
                setTeamName(editInput);
                setEditModal(false);
              }}
            >
              CONFIRM TEAM
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
