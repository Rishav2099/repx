import axios from "axios"

export const fetchFriendRequests = async () => {
    const res = await axios.get('/api/friends/requests')
    return res.data
}

export const fetchFriends = async () => {
  const res = await axios.get('/api/friends')
  return res.data
}