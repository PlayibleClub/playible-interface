import Container from 'components/containers/Container';
import PortfolioContainer from 'components/containers/PortfolioContainer';
import BackFunction from 'components/buttons/BackFunction';
import ModalPortfolioContainer from 'components/containers/ModalPortfolioContainer';
import { useWalletSelector } from 'contexts/WalletSelectorContext';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Main from 'components/Main';
import LeaderboardComponent from '../components/LeaderboardComponent';
import ViewTeamsContainer from 'components/containers/ViewTeamsContainer';
import { query_game_data, query_all_players_lineup, query_player_teams } from 'utils/near/helper';
import { getNflWeek } from 'utils/date/helper';
import LoadingPageDark from 'components/loading/LoadingPageDark';
import { setTeamName, setAccountId, setGameId, setSport2 } from 'redux/athlete/teamSlice';
import { useDispatch } from 'react-redux';
import { persistor } from 'redux/athlete/store';
import { getSportType } from 'data/constants/sportConstants';
import moment, { Moment } from 'moment';
const Games = (props) => {
  const { query } = props;
  const gameId = query.game_id;
  const currentSport = query.sport.toString().toUpperCase();
  const router = useRouter();
  const dispatch = useDispatch();
  const [playerLineups, setPlayerLineups] = useState([]);

  const { accountId } = useWalletSelector();
  const [playerTeams, setPlayerTeams] = useState([]);
  const [gameInfo, setGameInfo] = useState([]);
  const [week, setWeek] = useState(0);
  const [gameData, setGameData] = useState(null);
  const playGameImage = '/images/game.png';
  async function get_game_data(game_id) {
    setGameInfo(await query_game_data(game_id, getSportType(currentSport).gameContract));
    setGameData(await query_game_data(game_id, getSportType(currentSport).gameContract));
  }

  const gameStart = Object.values(gameInfo)[0] / 1000;
  console.log('nfl week: ' + week);

  async function get_game_week() {
    setWeek(await getNflWeek(gameStart));
  }

  async function get_all_players_lineup() {
    console.log('    TEST start date: ' + moment(gameData.start_time).format('YYYY-MM-DD-hh-mm-ss'));
    console.log('    TEST end date: ' + moment(gameData.end_time).format('YYYY-MM-DD-hh-mm-ss'));
    setPlayerLineups(
      await query_all_players_lineup(
        gameId,
        week,
        currentSport,
        moment(gameData.start_time).format('YYYY-MM-DD'),
        moment(gameData.end_time).format('YYYY-MM-DD')
      )
    );
  }

  async function get_player_teams(account, game_id) {
    setPlayerTeams(
      await query_player_teams(account, game_id, getSportType(currentSport).gameContract)
    );
  }
  const handleButtonClick = (teamName, accountId, gameId) => {
    dispatch(setTeamName(teamName));
    dispatch(setAccountId(accountId));
    dispatch(setGameId(gameId));
    dispatch(setSport2(currentSport));
    router.push('/EntrySummary');
  };
  useEffect(() => {
    if (gameData !== undefined && gameData !== null) {
      get_player_teams(accountId, gameId);
      get_all_players_lineup();
    }
  }, [gameData]);

  useEffect(() => {
    setTimeout(() => persistor.purge(), 200);
    get_game_data(gameId);
  }, [week]);

  useEffect(() => {
    console.log(playerLineups);
  }, [playerLineups]);
  useEffect(() => {
    get_game_week();
  });

  return (
    <Container activeName="GAMES">
      <div className="flex flex-col w-full overflow-y-auto h-screen">
        <Main color="indigo-white">
          <div className="mt-8 ml-6">
            <BackFunction prev="/Play" />
          </div>
          <div className="flex flex-row">
            <div className="md:ml-6 mt-11 flex flex-col w-auto">
              <div className="md:ml-7 mr-12">
                <Image
                  src={gameData?.game_image ? gameData?.game_image : playGameImage}
                  width={550}
                  height={279}
                  alt="game-image"
                />
              </div>
              <div className="mt-7 ml-6 w-3/5 md:w-1/2 md:ml-7 md:mt-2">
                <ModalPortfolioContainer title="VIEW TEAMS" textcolor="text-indigo-black mb-5" />
                {
                  /* @ts-expect-error */
                  playerTeams.team_names == undefined ? (
                    'No Teams Assigned'
                  ) : (
                    <div>
                      {/* @ts-expect-error */}
                      {playerTeams.team_names.map((data) => {
                        return (
                          <ViewTeamsContainer
                            teamNames={data}
                            gameId={gameId}
                            accountId={accountId}
                            onClickFn={(data, accountId, gameId) =>
                              handleButtonClick(data, accountId, gameId)
                            }
                          />
                        );
                      })}
                    </div>
                  )
                }
              </div>
            </div>

            <div className="md:ml-18 ml-18 mt-4">
              <ModalPortfolioContainer textcolor="indigo-black" title={'LEADERBOARD'} />
              <div className="overflow-y-auto">
                {playerLineups.length > 0 ? (
                  playerLineups.slice(0, 10).map((item, index) => {
                    return (
                      <LeaderboardComponent
                        accountId={item.accountId}
                        teamName={item.teamName}
                        teamScore={item.sumScore}
                        index={index}
                        gameId={gameId}
                        onClickFn={(teamName, accountId, gameId) =>
                          handleButtonClick(teamName, accountId, gameId)
                        }
                      />
                    );
                  })
                ) : (
                  <div className="-mt-10 -ml-12">
                    <LoadingPageDark />
                  </div>
                )}
              </div>
            </div>
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