{
    transaction(where: { type: { _eq: "xp" } }) {
      id
      type
      amount
      objectId
      userId
      createdAt
      path
    }
  }


  *******************
  {
    transaction(where: { type: { _eq: "up" } }) {
      id
      type
      amount
      objectId
      userId
      createdAt
      path
    }
  }
  ******************
    {
    transaction(where: { type: { _eq: "down" } }) {
      id
      type
      amount
      objectId
      userId
      createdAt
      path
    }
  }
*******************
// 2. User Progress Query

{
    progress(where: { object: { type: { _eq: "project" } } }) {
      id
      userId
      objectId
      grade
      createdAt
      updatedAt
      object {
        id
        name
        type
        attrs
      }}
    }
      

**********************
{
    result {
      id
      userId
      objectId
      grade
      createdAt
      updatedAt
    }
  }

****************
{
            user {
                id
                login
                totalUp
                totalDown
             	auditRatio
            }
            event_user(where: { userId: { _eq: 196 }, eventId:{_eq:20}}){
                level
          		userAuditRatio
            }
        }

******************
{
    user {
        login
        attrs
        campus
    }
}
*************

{
  transaction(
    where: {
      type: { _eq: "xp" }
      _and: [
        { path: { _like: "/bahrain/bh-module%" } },
        { path: { _nlike: "/bahrain/bh-module/checkpoint%" } },
        { path: { _nlike: "/bahrain/bh-module/piscine-js%" } }
      ]
    }
    order_by: { createdAt: desc }
    limit: 10
  ) {
    object {
      name
    }
  }
}
****************
{
    transaction(
      where: {
        type: {
          _iregex: "(^|[^[:alnum:]_])[[:alnum:]_]*skill_[[:alnum:]_]*($|[^[:alnum:]_])"
        }
      }
    ) {
      amount
      type
    }
  }
  *****************
  {progress(
      where: { isDone: { _eq: false }, object: { type: { _eq: "project" } } }
      limit: 1
    ) {
      object {
        name
      }
    }
  }
  ***********