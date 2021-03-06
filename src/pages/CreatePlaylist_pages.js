import {useEffect, useState} from 'react'; /*1. hooks with use useState and UseEffect*/
import {useSelector} from 'react-redux';
import axios from 'axios';
import Playlist from '../components/co_Playlist';
import Songs from '../components/co_TrackIndex';
import SearchForm from '../components/co_Search';
import Profile from './ProfilePages_pages';
import LogoutIcon from '@mui/icons-material/Logout';
import Button from '@mui/material/Button';

const CreatePlaylist = () => {
    const [tracksData, setTracksData] = useState([]);
    const [query, setQuery] = useState('');
    const [selectedSong, setselectedSong] = useState([]);
    const [mergedTracks, setMergedTracks] = useState([]);
    const accessToken = useSelector((state) => state.accessToken.value);
    const userID = useSelector((state) => state.user.value.userID);

    useEffect(() => {
        const mergedTracksWithselectedSong =
            tracksData.map((track) => ({
                ...track,
                Selected: !!selectedSong.find((selectedTrack) => selectedTrack === track.uri),
            }));
        setMergedTracks(mergedTracksWithselectedSong);
    }, [selectedSong, tracksData]);

    const handleSelect = (uri) => {
        const alreadySelected = selectedSong.find((selectedTrack) => selectedTrack === uri);
        if (alreadySelected) {
            setselectedSong(selectedSong.filter((selectedTrack) => selectedTrack !== uri));
        } else {
            setselectedSong((selectedSong) => [...selectedSong, uri]);
        }
        console.log(selectedSong);
    };

    const handleGetData = async () => {
        const data = await axios
            .get(
                `https://api.spotify.com/v1/search?q=${query}&type=track&access_token=${accessToken}`
            )
            .then((response) => response)
            .catch((error) => error);
        setTracksData(data.data.tracks.items);
        console.log(data);
    };

    const handleSearch = (e) => {
        setQuery(e.target.value);
    };

    const handleSubmitSearch = (e) => {
        e.preventDefault();
        handleGetData();
    };

    const [addPlaylistData, setAddPlaylistData] = useState({
        title: '',
        description: '',
    });

    const bodyParams = {
        name: addPlaylistData.title,
        description: addPlaylistData.description,
        collaborative: false,
        public: false
    };

    const header = {
        Authorization: `Bearer ${accessToken}`
    };

    const hanldeAddPlaylist = (e) => {
        const {name, value} = e.target;
        setAddPlaylistData({...addPlaylistData, [name]: value});
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const data = await axios
            .post(
                `https://api.spotify.com/v1/users/${userID}/playlists`, bodyParams,
                {
                    headers: header
                }
            )
            .catch((error) => error);
        console.log('Playlist created: ', data);
        handlAddSongPlaylist(data.data.id);
    };

    const itemParams = {
        uris: selectedSong
    };

    const handlAddSongPlaylist = async (playlist_id) => {
        const data = await axios
            .post(
                `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, itemParams,
                {
                    headers: header
                }
            )
            .catch((error) => error);
            console.log('Items added to playlist: ', data);
    };
    //Eslint = this is one of the eslint files I use  
    // eslint-disable-next-line no-unused-vars
    const [masuk,setmasuk] = useState(false);
    const handlekeluar = ()=>{
        setmasuk(false);
        localStorage.clear();
        window.location = `https://testfinal-one.vercel.app/`;
    };

    return (
        <>
            <h1> Spotify</h1>
            <h1>Create your Playlist</h1>
            <div className='profileform'>
                <Profile/>
                <Button onClick={handlekeluar} size='large' variant="contained" color="primary" startIcon={<LogoutIcon />}> LOGOUT </Button>
            </div>

            <Playlist
                hanldeAddPlaylist={hanldeAddPlaylist}
                handleAddSubmit={handleAddSubmit}
                addPlaylistData={addPlaylistData} />

            <div className="searchform">
                <SearchForm
                    onSubmit={handleSubmitSearch}
                    onChange={handleSearch} />
                <br />
                <div className='containersong'>
                    {mergedTracks !== undefined && (
                        <Songs
                            mergedTracks={mergedTracks}
                            handleSelect={handleSelect} key={mergedTracks.uri} />
                    )}
                </div>
            </div>
        </>
    );
};

export default CreatePlaylist;