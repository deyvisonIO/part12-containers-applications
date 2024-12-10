db.createUser({
  user: 'root',
  pwd: 'root',
  roles: [
    {
      role: 'dbOwner',
      db: 'bloglistApp',
    },
    {
      role: 'dbOwner',
      db: 'testBloglistApp',
    }
  ],
});
