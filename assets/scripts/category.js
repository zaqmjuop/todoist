import ArrayStorage from 'arraystorage';

const quadrants = {
  1: { important: 1, urgent: 1 },
  2: { important: 1, urgent: 0 },
  3: { important: 0, urgent: 1 },
  4: { important: 0, urgent: 0 },
};

const category = new ArrayStorage({ databaseName: 'category' });

const appoint = (missionPrimaryKey, quadrant) => {
  // 指定4象限,保存记录 { primaryKey: ?, missionPrimaryKey, important: ?, urgent: ? }
  // missionPrimaryKey是任务主键，quadrant是一个1-4的数字从quadrants取值，quadrant不是1-4的数字报错
  if (!Number.isSafeInteger(missionPrimaryKey)) { throw new TypeError(`missionPrimaryKey不能是${missionPrimaryKey}`); }
  const detail = quadrants[quadrant];
  if (!detail) { throw new TypeError(`quadrant不能是${quadrant}`); }
  const promise = category.find(item => (item.missionPrimaryKey === missionPrimaryKey))
    .then((res) => {
      const data = res || Object.assign(detail, { missionPrimaryKey });
      let insert;
      if (data.primaryKey) {
        insert = category.update(data);
      } else {
        insert = category.push(data);
      }
      return insert;
    });
  return promise;
};

export default category;
