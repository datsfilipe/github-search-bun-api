import { serve, fetch } from "bun"

/**
  * @description
  * simple bun server that resopond json results based on params [
  *   @search: look for repositories and users and receive an shuffed array of results,
  *   @user: look for a user and receive an json object with the user info
  * ]
*/

serve({
  async fetch(req) {
    const route = req.url.split("/").slice(1)[2]

    if (!route.includes("api")) {
      return new Response("No way, bruh", {
        status: 404,
      })
    }

    const search = req.url.split("search=")[1]
    const user = req.url.split("user=")[1]

    if (search) {
      const returnedUsers = await fetch(`https://api.github.com/search/users?q=${search}`)
        .then(res => res.json())
        .then(json => json.items.map(user => ({
          id: user.id,
          name: user.login,
          url: user.html_url,
        })));

      const returnedRepos = await fetch(`https://api.github.com/search/repositories?q=${search}`)
        .then(res => res.json())
        .then(json => json.items.map(repo => ({
          id: repo.id,
          name: repo.name,
          url: repo.html_url,
        })));

      const response = [...returnedUsers, ...returnedRepos].sort(() => Math.random() - 0.5)

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
        "Content-Type": "application/json"
        }
      })
    } else if (user) {
      const returnedUser = await fetch(`https://api.github.com/users/${user}`)
        .then(res => res.json())
        .then(json => ({
          id: json.id,
          username: json.login,
          name: json.name,
          company: json.company,
          location: json.location,
          url: json.html_url,
        }));

      if (returnedUser.username !== undefined) {
        return new Response(JSON.stringify(returnedUser), {
          status: 200,
          headers: {
          "Content-Type": "application/json"
          }
        })
      } else {
        return new Response("User not found", {
          status: 404,
        })
      }
    } else {
      return new Response("I have no idea what you want", {
        status: 400,
      })
    }
  },
  port: 3000
});
