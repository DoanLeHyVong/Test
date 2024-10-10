const axios = require("axios");

function calculatePrefixSums(data) {
  const n = data.length;
  const prefixSum = new Array(n + 1).fill(0);
  const alternatingSum = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    prefixSum[i] = prefixSum[i - 1] + data[i - 1];
    alternatingSum[i] =
      alternatingSum[i - 1] + (i % 2 === 1 ? data[i - 1] : -data[i - 1]);
  }

  return { prefixSum, alternatingSum };
}

function processQuery(query, prefixSum, alternatingSum) {
  const [l, r] = query.range;

  if (query.type === "1") {
    return prefixSum[r + 1] - prefixSum[l];
  } else {
    let result = alternatingSum[r + 1] - alternatingSum[l];
    if (l % 2 === 0) {
      result = -result;
    }
    return result;
  }
}

async function main() {
  try {
    const response = await axios.get(
      "https://test-share.shub.edu.vn/api/intern-test/input"
    );
    const { token, data, query } = response.data;

    console.log(response.data);

    const { prefixSum, alternatingSum } = calculatePrefixSums(data);

    const results = query.map((q) =>
      processQuery(q, prefixSum, alternatingSum)
    );

    console.log(results);

    const outputResponse = await axios.post(
      "https://test-share.shub.edu.vn/api/intern-test/output",
      results,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Response:", outputResponse.data);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
