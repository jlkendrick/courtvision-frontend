import axios from 'axios';

export async function getLeague(leagueid: string, leagueyear: string, teamname: string, s2: string, swid: string) {
    try {
        const response = await axios.post(`http://localhost:3001/league/${leagueid}/${leagueyear}/${teamname}/${s2}/${swid}`)
        return response.data
    } catch (error) {
        console.error('Error getting league', error)
    }
}