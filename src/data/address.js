import { getCurrentUser } from './user.js';

const getAddresses = () => {
  const user = getCurrentUser();
  if (!user) return [];
  const addresses = localStorage.getItem(`addresses_${user.username}`);
  if (addresses) {
    return JSON.parse(addresses);
  }
  const defaultAddresses = [
    {
      id: 1,
      username: '张三',
      phone: '13800138000',
      province: '西安市',
      city: '西安市',
      detail: '邮电大学1号楼1单元101',
      isDefault: true
    },
    {
      id: 2,
      username: '张三',
      phone: '13900139000',
      province: '上海市',
      city: '上海市',
      detail: '浦东新区某某路888号',
      isDefault: false
    }
  ];
  saveAddresses(defaultAddresses);
  return defaultAddresses;
};

const saveAddresses = (addresses) => {
  const user = getCurrentUser();
  if (!user) return;
  localStorage.setItem(`addresses_${user.username}`, JSON.stringify(addresses));
};

export const getUserAddresses = () => {
  return getAddresses();
};

export const getDefaultAddress = () => {
  const addresses = getAddresses();
  return addresses.find(addr => addr.isDefault) || addresses[0] || null;
};

export const addAddress = (addressData) => {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, msg: '请先登录！' };
  }

  const addresses = getAddresses();
  const newId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1;
  
  if (addressData.isDefault) {
    addresses.forEach(addr => addr.isDefault = false);
  }

  const newAddress = {
    id: newId,
    ...addressData
  };

  addresses.push(newAddress);
  saveAddresses(addresses);

  return { success: true, msg: '地址添加成功！', address: newAddress };
};

export const updateAddress = (id, addressData) => {
  const addresses = getAddresses();
  const index = addresses.findIndex(addr => addr.id === id);
  
  if (index === -1) {
    return { success: false, msg: '地址不存在！' };
  }

  if (addressData.isDefault) {
    addresses.forEach(addr => addr.isDefault = false);
  }

  addresses[index] = { ...addresses[index], ...addressData };
  saveAddresses(addresses);

  return { success: true, msg: '地址更新成功！', address: addresses[index] };
};

export const deleteAddress = (id) => {
  const addresses = getAddresses();
  const index = addresses.findIndex(addr => addr.id === id);
  
  if (index === -1) {
    return { success: false, msg: '地址不存在！' };
  }

  addresses.splice(index, 1);
  saveAddresses(addresses);

  return { success: true, msg: '地址删除成功！' };
};

export const setDefaultAddress = (id) => {
  const addresses = getAddresses();
  const address = addresses.find(addr => addr.id === id);
  
  if (!address) {
    return { success: false, msg: '地址不存在！' };
  }

  addresses.forEach(addr => addr.isDefault = addr.id === id);
  saveAddresses(addresses);

  return { success: true, msg: '已设为默认地址！' };
};
