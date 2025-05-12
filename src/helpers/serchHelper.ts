


function searchUsers(query: string, data: { name: string }[]) {
  const regex = new RegExp(query, "i");
  return data.filter(user => regex.test(user.name));
}