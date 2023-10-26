let uid = 0;

const generateItem = (value) => {
  return {
    id: uid,
    desc: `组件: ${value}`,
    type: value,
  };
};

// const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
const alphabet = ["A", "B"];

export const getData = async () => {
  return new Promise((res, rej) => {
    const data = [];
    for (let i = 0; i < 300; i++) {
      alphabet.forEach((v) => {
        let j = 5;
        while (j--) {
          data.push(generateItem(v));
        }
      });
    }
    res(data);
  });
};
