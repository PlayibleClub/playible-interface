import React, { useEffect, useState } from 'react';
import { transactions, utils, WalletConnection, providers } from 'near-api-js';
import { getRPCProvider, getContract } from 'utils/near';
import BackFunction from 'components/buttons/BackFunction';
import Container from 'components/containers/Container';
import PortfolioContainer from 'components/containers/PortfolioContainer';
import router, { useRouter } from 'next/router';
import { useWalletSelector } from 'contexts/WalletSelectorContext';
import { convertNftToAthlete, getAthleteInfoById } from 'utils/athlete/helper';
import { ATHLETE, ATHLETE_SOULBOUND } from 'data/constants/nearContracts';
import AthleteSelectContainer from 'components/containers/AthleteSelectContainer';
import Link from 'next/link';
import SearchComponent from 'components/SearchComponent';
import ReactPaginate from 'react-paginate';
import PerformerContainer from 'components/containers/PerformerContainer';
import { Provider, useDispatch, useSelector } from 'react-redux';
import {
  selectAthleteLineup,
  selectGameId,
  selectIndex,
  selectPosition,
  selectTeamName,
} from 'redux/athlete/athleteSlice';
import {
  setAthleteLineup,
  setGameId,
  setIndex,
  setPosition,
  setTeamNameRedux,
} from 'redux/athlete/athleteSlice';
import { query_filter_supply_for_owner, query_filter_tokens_for_owner } from 'utils/near/helper';

const AthleteSelect = (props) => {
  const { query } = props;

  //const teamName = query.teamName;

  //const position = query.position;
  const router = useRouter();
  const data = router.query;
  const dispatch = useDispatch();
  //Get the data from redux store
  const gameId = useSelector(selectGameId);
  const position = useSelector(selectPosition);
  const index = useSelector(selectIndex);
  const reduxLineup = useSelector(selectAthleteLineup);
  let passedLineup = [...reduxLineup];
  const [athletes, setAthletes] = useState([]);
  const [athleteOffset, setAthleteOffset] = useState(0);
  const [regularOffset, setRegularOffset] = useState(0);
  const [soulOffset, setSoulOffset] = useState(0);
  const [soulPage, setSoulPage] = useState(-1);
  const [currentPage, setCurrentPage] = useState(0);
  const [isUsingSoul, setIsUsingSoul] = useState(false);
  const [athleteLimit, setAthleteLimit] = useState(8);
  const [totalAthletes, setTotalAthletes] = useState(0);
  const [totalSoulbound, setTotalSoulbound] = useState(0);
  const [radioSelected, setRadioSelected] = useState(null);
  const [team, setTeam] = useState(['allTeams']);
  const [name, setName] = useState(['allNames']);
  const [lineup, setLineup] = useState([]);
  const { accountId } = useWalletSelector();
  const [pageCount, setPageCount] = useState(0);
  const [remountComponent, setRemountComponent] = useState(0);
  const [search, setSearch] = useState('');
  const [currPosition, setCurrPosition] = useState('');
  const [loading, setLoading] = useState(true);
  const provider = new providers.JsonRpcProvider({
    url: getRPCProvider(),
  });

  async function get_filter_supply_for_owner(accountId, position, team, name, contract) {
    setTotalAthletes(
      await query_filter_supply_for_owner(accountId, position, team, name, contract)
    );
  }

  async function get_filter_soulbound_supply_for_owner(accountId, position, team, name, contract) {
    setTotalSoulbound(
      await query_filter_supply_for_owner(accountId, position, team, name, contract)
    );
  }

  function get_filter_tokens_for_owner(
    accountId,
    athleteOffset,
    athleteLimit,
    position,
    team,
    name,
    contract
  ) {
    return query_filter_tokens_for_owner(
      accountId,
      athleteOffset,
      athleteLimit,
      position,
      team,
      name,
      contract
    ).then(async (data) => {
      // @ts-ignore:next-line
      const result = JSON.parse(Buffer.from(data.result).toString());

      const result_two = await Promise.all(result.map(convertNftToAthlete).map(getAthleteInfoById));

      return result_two;
      // const sortedResult = sortByKey(result_two, 'fantasy_score');
      // setCurrPosition(position);
      // setAthletes(result_two);
      // setLoading(false);
    });
  }

  //TODO: might encounter error w/ loading duplicate athlete
  function setAthleteRadio(radioIndex) {
    console.log(athletes[radioIndex]);
    passedLineup.splice(index, 1, {
      position: position,
      isAthlete: true,
      isPromo: athletes[radioIndex].athlete_id.includes('SB') ? true : false,
      athlete: athletes[radioIndex],
    });
    console.table(passedLineup);
    setLineup(passedLineup);
  }
  function getPositionDisplay(position) {
    if (position.length === 3) return 'FLEX';
    if (position.length === 4) return 'SUPERFLEX';
    switch (position[0]) {
      case 'QB':
        return 'QUARTER BACK';
      case 'RB':
        return 'RUNNING BACK';
      case 'WR':
        return 'WIDE RECEIVER';
      case 'TE':
        return 'TIGHT END';
    }
  }
  function checkIfAthleteExists(athlete_id) {
    for (let i = 0; i < passedLineup.length; i++) {
      if (passedLineup[i].isAthlete === true) {
        if (athlete_id === passedLineup[i].athlete.athlete_id) {
          return true;
        }
      }
    }
    return false;
  }
  async function handleRegularSoulboundPagination() {
    await get_filter_tokens_for_owner(
      accountId,
      athleteOffset,
      athleteLimit,
      position,
      team,
      name,
      soulPage === -1 ? getContract(ATHLETE) : getContract(ATHLETE_SOULBOUND)
    ).then((result) => {
      console.log(soulPage);
      console.log('length: ' + result.length);
      console.log('limit: ' + athleteLimit);
      console.log('total: ' + totalAthletes);
      if (result.length < athleteLimit && soulPage === -1) {
        let sbLimit = athleteLimit - result.length;
        get_filter_tokens_for_owner(
          accountId,
          0,
          sbLimit,
          position,
          team,
          name,
          getContract(ATHLETE_SOULBOUND)
        ).then((result2) => {
          if (result.length === 0) {
            setAthletes(result2);
            setSoulPage(0);
          } else if (result.length > 0) {
            let diff = result.length - result2.length;
            console.log(diff);
            result2.map((obj) => result.push(obj));
            setAthletes([...result]);

            setSoulPage(0);
            if (diff < 0) {
              setSoulOffset(Math.abs(diff) + 1);
            } else if (diff > 0) {
              setSoulOffset(athleteLimit - diff - 1);
            }
          }
        });
      } else if (result.length === athleteLimit && soulPage === -1) {
        console.log(currentPage);
        if (result.length * (currentPage + 1) === totalAthletes) {
          console.log('did go here');
          setAthletes(result);
          setSoulPage(0);
        } else {
          setAthletes(result);
        }
        // if (result.length * currentPage === totalAthletes) {
        //   setSoulPage(0);
        // }
      } else if (soulPage === 0) {
        setAthletes(result);
      }
    });
    // console.log(regular);
    // if (regular.length < 8 && soulPage === -1) {
    //   //mixed page with regular and soulbound athletes
    //   setSoulPage(0);
    //   let sbLimit = athleteLimit - regular.length;
    //   let soulbound = get_filter_tokens_for_owner(
    //     accountId,
    //     0,
    //     sbLimit,
    //     position,
    //     team,
    //     name,
    //     getContract(ATHLETE_SOULBOUND)
    //   );

    //   if (regular.length === 0) {
    //     setAthletes(soulbound);
    //   } else if (regular.length > 0) {
    //     setAthletes([...regular, soulbound]);
    //   }
    // } else if (regular.length === 8) {
    //   setAthletes(regular);
    // }
  }
  function handleDropdownChange() {
    setAthleteOffset(0);
    setAthleteLimit(7);
    setRemountComponent(Math.random());
  }

  const handlePageClick = (e) => {
    let newOffset;
    console.log(e.selected);
    if (soulPage === -1) {
      if (e.selected * athleteLimit >= totalAthletes) {
        setSoulPage(0);
        newOffset = 0 * athleteLimit;
      } else {
        newOffset = ((e.selected * athleteLimit) % totalAthletes) + soulOffset;
      }
    } else if (soulPage > -1) {
      let newPage = e.selected;
      let compute = newPage - currentPage;
      console.log(compute);
      let test = soulPage - compute;
      console.log(test);
      if (soulPage - compute <= -1) {
        console.log(soulPage + ' + ' + compute);
        newOffset = (soulPage + (compute - 1)) * athleteLimit + soulOffset;
      } else {
        console.log('test');
        newOffset = (e.selected * athleteLimit) % totalAthletes;
        setSoulPage(-1);
        setSoulOffset(0);
      }
    }
    // const newOffset = (e.selected * athleteLimit) % totalAthletes;
    //add reset of lineup
    passedLineup.splice(index, 1, {
      position: position,
      isAthlete: false,
      isPromo: false,
    });
    setRadioSelected(null);
    setAthleteOffset(newOffset);
    setCurrentPage(e.selected);
  };
  const handleRadioClick = (value) => {
    console.log(value);
    setRadioSelected(value);
    setAthleteRadio(value);
  };

  const handleProceedClick = (game_id, lineup) => {
    dispatch(setGameId(game_id));
    dispatch(setAthleteLineup(lineup));
    router.push({
      pathname: '/CreateTeam/[game_id]',
      query: { game_id: game_id },
    });
  };
  useEffect(() => {
    //if regular and soulbound radio buttons are enabled

    handleRegularSoulboundPagination();
    //else
    // if (!isNaN(athleteOffset)) {
    //   //if normal radio button is selected
    //   get_filter_supply_for_owner(accountId, position, team, name, getContract(ATHLETE));
    //   //if sb radio button is selected
    //   //get_filter_supply_for_owner(accountId, position, team, name, getContract(ATHLETE_SOULBOUND));
    //   setPageCount(Math.ceil(totalAthletes / athleteLimit));
    //   const endOffset = athleteOffset + athleteLimit;
    //   console.log(`Loading athletes from ${athleteOffset} to ${endOffset}`);
    //   get_filter_tokens_for_owner(
    //     accountId,
    //     athleteOffset,
    //     athleteLimit,
    //     position,
    //     team,
    //     name,
    //     getContract(ATHLETE)
    //   );
    // }
  }, [totalAthletes, currentPage]);

  useEffect(() => {
    get_filter_supply_for_owner(accountId, position, team, name, getContract(ATHLETE));
    get_filter_soulbound_supply_for_owner(
      accountId,
      position,
      team,
      name,
      getContract(ATHLETE_SOULBOUND)
    );
    setPageCount(Math.ceil((totalAthletes + totalSoulbound) / athleteLimit));
    //setup regular_offset, soulbound_offset
  }, [team, name]);
  // useEffect(() => {
  //   console.log(totalAthletes);
  //   console.log(totalSoulbound);
  // }, [totalAthletes, totalSoulbound]);
  useEffect(() => {}, [search]);
  useEffect(() => {
    console.log('soul offset: ' + soulOffset);
  }, [soulOffset]);
  useEffect(() => {
    console.log('total soulbound: ' + totalSoulbound);
  }, [totalSoulbound]);
  return (
    <>
      <Container activeName="PLAY">
        <div className="mt-44 md:ml-6 md:mt-6">
          <BackFunction prev={`/CreateTeam/${gameId}`} />
          <PortfolioContainer
            title={'SELECT YOUR ' + getPositionDisplay(position)}
            textcolor="text-indigo-black"
          />
        </div>

        <div className="h-8 flex absolute ml-3 top-32 mr-8 md:top-24 md:right-20 md:-mt-5 ">
          <SearchComponent
            onChangeFn={(search) => setName(search)}
            onSubmitFn={(search) => setName(search)}
          />
          {/* <form
            onSubmit={(e) => {
              handleDropdownChange();
              search == '' ? setName(['allNames']) : setName([search]);
              e.preventDefault();
            }}
          >
            <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300">
              Search
            </label>
            <div className="relative lg:ml-80">
              <input
                type="search"
                id="default-search"
                onChange={(e) => setSearch(e.target.value)}
                className=" bg-indigo-white w-72 pl-2
                            ring-2 ring-offset-4 ring-indigo-black ring-opacity-25 focus:ring-2 focus:ring-indigo-black 
                            focus:outline-none"
                placeholder="Search Athlete"
              />
              <button
                type="submit"
                className="bg-search-icon bg-no-repeat bg-center absolute -right-12 bottom-0 h-full
                            pl-8 md:pl-6 py-2 ring-2 ring-offset-4 ring-indigo-black ring-opacity-25
                            focus:ring-2 focus:ring-indigo-black"
              ></button>
            </div>
          </form> */}
        </div>

        <div className="flex flex-col">
          <div className="grid grid-cols-4 mt-1 md:grid-cols-4 md:ml-7 md:mt-2">
            {athletes.map((item, i) => {
              const accountAthleteIndex = athletes.indexOf(item, 0) + athleteOffset;

              return (
                <>
                  {checkIfAthleteExists(item.athlete_id) || item.isInGame ? (
                    <div className="w-4/5 h-5/6 border-transparent pointer-events-none">
                      <div className="mt-1.5 w-full h-14px mb-1"></div>
                      <PerformerContainer
                        key={item.athlete_id}
                        AthleteName={item.athlete_id.includes('SB') ? 'SOULBOUND' : item.name}
                        AvgScore={item.fantasy_score.toFixed(2)}
                        id={item.athlete_id}
                        uri={item.image}
                        index={accountAthleteIndex}
                        isSelected={true}
                        isInGame={item.isInGame}
                        fromPortfolio={false}
                      />
                    </div>
                  ) : (
                    <label className="w-4/5 h-5/6">
                      <div className="w-full h-full border-transparent focus:border-transparent focus:ring-2 focus:ring-blue-300 focus:border-transparent">
                        <input
                          className="justify-self-end"
                          type="radio"
                          checked={radioSelected == i}
                          value={i}
                          onChange={(e) => handleRadioClick(e.target.value)}
                        ></input>
                        <PerformerContainer
                          key={item.athlete_id}
                          AthleteName={item.athlete_id.includes('SB') ? 'SOULBOUND' : item.name}
                          AvgScore={item.fantasy_score.toFixed(2)}
                          id={item.athlete_id}
                          uri={item.image}
                          index={accountAthleteIndex}
                          fromPortfolio={false}
                        />
                      </div>
                    </label>
                  )}
                </>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-10 right-10"></div>
        <div className="absolute z-0 bottom-10 right-10 iphone5:bottom-4 iphone5:right-2 iphone5:fixed iphoneX:bottom-4 iphoneX:right-4 iphoneX-fixed">
          <div key={remountComponent}>
            <ReactPaginate
              className="p-2 content-center justify-center bg-indigo-buttonblue text-indigo-white flex flex-row space-x-4 select-none ml-7"
              pageClassName="hover:font-bold"
              activeClassName="rounded-lg text-center bg-indigo-white text-indigo-black pr-1 pl-1 font-bold"
              pageLinkClassName="rounded-lg text-center hover:font-bold hover:bg-indigo-white hover:text-indigo-black"
              breakLabel="..."
              nextLabel=">"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={pageCount}
              previousLabel="<"
              renderOnZeroPageCount={null}
            />
            <button
              className="bg-indigo-buttonblue text-indigo-white w-full ml-7 mt-4 md:w-60 h-14 text-center font-bold text-md"
              onClick={() => handleProceedClick(gameId, lineup)}
            >
              PROCEED
            </button>
          </div>
        </div>
      </Container>
    </>
  );
};
export default AthleteSelect;

export async function getServerSideProps(ctx) {
  const { query } = ctx;

  if (query.id != query.id) {
    return {
      desination: query.origin || '/CreateTeam',
    };
  }

  return {
    props: { query },
  };
}
