export default `
  query ($orgName: String!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    organization(login: $orgName) {
      id
      login
      url
    }
  }
`;
