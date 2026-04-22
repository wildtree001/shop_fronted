const getUsers = () => {
    const users = localStorage.getItem('mallUsers');
    return users ? JSON.parse(users) : [];
  };
  
  const saveUsers = (users) => {
    localStorage.setItem('mallUsers', JSON.stringify(users));
  };
  
  /**
   * 注册用户（新增用户昵称字段）
   * @param {string} username - 登录账号
   * @param {string} password - 登录密码
   * @param {string} nickname - 用户昵称（显示在首页）
   * @returns {object} 注册结果
   */
  export const registerUser = (username, password, nickname) => {
    const users = getUsers();
    const isExist = users.some(user => user.username === username);
    if (isExist) {
      return { success: false, msg: '用户名已存在！' };
    }
    users.push({ username, password, nickname });
    saveUsers(users);
    return { success: true, msg: '注册成功！' };
  };
  
  /**
   * 登录验证（返回用户昵称）
   * @param {string} username - 登录账号
   * @param {string} password - 登录密码
   * @returns {object} 登录结果+用户信息
   */
  export const loginUser = (username, password) => {
    const users = getUsers();
    const user = users.find(item => item.username === username && item.password === password);
    if (user) {
      // 保存登录状态（含账号+昵称，持久化）
      localStorage.setItem('currentUser', JSON.stringify({
        username: user.username,
        nickname: user.nickname // 关键：存储昵称
      }));
      return { success: true, msg: '登录成功！', user };
    }
    return { success: false, msg: '用户名或密码错误！' };
  };
  
  // 获取当前登录用户（含昵称）
  export const getCurrentUser = () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  };
  
  // 退出登录（清除登录状态）
  export const logoutUser = () => {
    localStorage.removeItem('currentUser');
    return { success: true, msg: '退出成功！' };
  };

  // 修改用户昵称
  export const updateUserNickname = (newNickname) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, msg: '请先登录！' };
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    if (userIndex === -1) {
      return { success: false, msg: '用户不存在！' };
    }

    users[userIndex].nickname = newNickname;
    saveUsers(users);

    const updatedUser = {
      username: currentUser.username,
      nickname: newNickname
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    return { success: true, msg: '昵称修改成功！', user: updatedUser };
  };

  // 重置密码
  export const resetPassword = (oldPassword, newPassword) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, msg: '请先登录！' };
    }

    if (!oldPassword || !newPassword) {
      return { success: false, msg: '密码不能为空！' };
    }

    if (newPassword.length < 6) {
      return { success: false, msg: '新密码长度不能少于6位！' };
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    if (userIndex === -1) {
      return { success: false, msg: '用户不存在！' };
    }

    if (users[userIndex].password !== oldPassword) {
      return { success: false, msg: '原密码错误！' };
    }

    users[userIndex].password = newPassword;
    saveUsers(users);

    return { success: true, msg: '密码修改成功！' };
  };

