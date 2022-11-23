import Container from 'components/containers/Container';
import PortfolioContainer from 'components/containers/PortfolioContainer';
import BackFunction from 'components/buttons/BackFunction';
import ModalPortfolioContainer from 'components/containers/ModalPortfolioContainer';
import Link from 'next/link';
import { getContract, getRPCProvider } from 'utils/near';
import { providers } from 'near-api-js';
import { useWalletSelector } from 'contexts/WalletSelectorContext';
import { useEffect, useState } from 'react';
import { GAME, ATHLETE } from 'data/constants/nearContracts';
import { getAthleteInfoById, convertNftToAthlete } from 'utils/athlete/helper';
import Image from 'next/image';
import { useRouter } from 'next/router';
import moment from 'moment';
import Main from 'components/Main';
import LeaderboardComponent from './components/LeaderboardComponent';

const Games = (props) => {
  const { query } = props;
  const router = useRouter();
  const week = router.query.week;
  const gameId = query.game_id;

  const [playerLineups, setPlayerLineups] = useState([]);

  const provider = new providers.JsonRpcProvider({
    url: getRPCProvider(),
  });
  const { accountId } = useWalletSelector();
  const [playerTeams, setPlayerTeams] = useState([]);

  function get_all_players_lineup() {
    const query = JSON.stringify({
      game_id: gameId,
    });

    provider
      .query({
        request_type: 'call_function',
        finality: 'optimistic',
        account_id: getContract(GAME),
        method_name: 'get_all_players_lineup',
        args_base64: Buffer.from(query).toString('base64'),
      })
      .then(async (data) => {
        // @ts-ignore:next-line
        const result = JSON.parse(Buffer.from(data.result).toString());

        const arrayToReturn = await Promise.all(
          result.map(async (item) => {
            let itemToReturn = {
              accountId: item[0][0],
              teamName: item[0][2],
              lineup: item[1].lineup,
              sumScore: 0,
            };

            itemToReturn.lineup = await Promise.all(
              itemToReturn.lineup.map((item) => {
                return query_nft_token_by_id(item);
              })
            );

            itemToReturn.lineup = itemToReturn.lineup.map((lineupItem) => {
              return {
                ...lineupItem,
                stats_breakdown:
                  lineupItem.stats_breakdown
                    .filter(
                      (statType) =>
                        statType.type == 'weekly' && statType.played == 1 && statType.week == week
                    )
                    .map((item) => {
                      return item.fantasyScore;
                    })[0] || 0,
              };
            });

            itemToReturn.sumScore = itemToReturn.lineup.reduce((accumulator, object) => {
              return accumulator + object.stats_breakdown;
            }, 0);

            return itemToReturn;
          })
        );

        arrayToReturn.sort(function (a, b) {
          return b.sumScore - a.sumScore;
        });

        setPlayerLineups(arrayToReturn);
      });
  }

  function query_nft_token_by_id(item) {
    const query = JSON.stringify({
      token_id: item,
    });

    return provider
      .query({
        request_type: 'call_function',
        finality: 'optimistic',
        account_id: getContract(ATHLETE),
        method_name: 'nft_token_by_id',
        args_base64: Buffer.from(query).toString('base64'),
      })
      .then(async (data) => {
        // @ts-ignore:next-line
        const result = JSON.parse(Buffer.from(data.result).toString());
        const result_two = await getAthleteInfoById(await convertNftToAthlete(result));
        return result_two;
      });
  }

  useEffect(() => {
    get_all_players_lineup();
  }, []);

  function query_player_teams() {
    const query = JSON.stringify({
      account: accountId,
      game_id: gameId,
    });

    provider
      .query({
        request_type: 'call_function',
        finality: 'optimistic',
        account_id: getContract(GAME),
        method_name: 'get_player_team',
        args_base64: Buffer.from(query).toString('base64'),
      })
      .then((data) => {
        // @ts-ignore:next-line
        const playerTeamNames = JSON.parse(Buffer.from(data.result));

        setPlayerTeams(playerTeamNames);
      });
  }

  useEffect(() => {
    console.log('loading');
    query_player_teams();
    console.log(playerTeams);
  }, []);

  return (
    <Container activeName="GAMES">
      <div className="flex flex-row md:flex-col">
        <Main color="indigo-white">
          <div className="mt-8 ml-6">
            <BackFunction prev="/Play" />
          </div>
          <div className="md:ml-6 mt-11 flex w-auto">
            <div className="md:ml-7 mr-12">
              <Image src="/images/game.png" width={550} height={279} alt="game-image" />
            </div>
            <div className="md:ml-18 md:-mt-6 ml-18 -mt-6">
              <ModalPortfolioContainer textcolor="indigo-black" title={'LEADERBOARD'} />
              <div>
                {playerLineups.length > 0
                  ? playerLineups.map((item, index) => {
                      return (
                        <LeaderboardComponent
                          teamName={item.teamName}
                          teamScore={item.sumScore}
                          index={index}
                        />
                      );
                    })
                  : 'Leaderboard ranks are currently not available at this time.'}
              </div>
            </div>
          </div>

          <div className="mt-7 ml-6 w-3/5 md:w-1/3 md:ml-12 md:mt-2">
            <ModalPortfolioContainer title="VIEW TEAMS" textcolor="text-indigo-black mb-5" />
            {
              /* @ts-expect-error */
              playerTeams.team_names == undefined ? (
                <p>No teams assigned</p>
              ) : (
                <div>
                  {/* @ts-expect-error */}
                  {playerTeams.team_names.map((data) => {
                    return (
                      <div className="p-5 px-6 bg-black-dark text-indigo-white mb-5 flex justify-between">
                        <p className="font-monument">{data}</p>
                        <Link
                          href={{
                            pathname: '/EntrySummary/[game_id]',
                            query: {
                              team_id: data,
                              game_id: gameId,
                            },
                          }}
                          as={`/EntrySummary/${gameId}/${data}`}
                        >
                          <img src={'/images/arrow-top-right.png'} />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        </Main>
      </div>
    </Container>
  );
};
export default Games;

export async function getServerSideProps(ctx) {
  const { query } = ctx;

  if (query.game_id != query.game_id) {
    return {
      desination: query.origin || '/Play',
    };
  }

  return {
    props: { query },
  };
}