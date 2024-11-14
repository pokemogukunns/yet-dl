import fetch from 'node-fetch'; // fetchモジュールをインポート
import { URLSearchParams } from 'url';

// APIエンドポイントリスト
const apis = [
  'https://youtube.privacyplz.org/',
  'https://inv.nadeko.net/'
];

const maxApiWaitTime = 5000; // 最大待機時間 (ミリ秒)
const maxTime = 15 * 1000; // 最大リクエスト時間 (ミリ秒)

async function apirequest(url) {
  const startTime = Date.now();
  
  // APIリストの各APIにリクエストを順番に送信
  for (let i = 0; i < apis.length; i++) {
    const api = apis[i];
    
    if (Date.now() - startTime >= maxTime - 1000) {
      break;
    }

    try {
      // APIリクエスト
      const res = await fetch(api + url, { timeout: maxApiWaitTime });

      if (res.ok) {
        const data = await res.json();
        if (isJson(data)) {
          return data; // 正常なレスポンスを返す
        } else {
          console.error(`APIのレスポンスがJSONではありません: ${api}`);
        }
      } else {
        console.error(`エラー: ${api}`);
      }
    } catch (error) {
      console.error(`タイムアウトまたはエラー: ${api}`, error);
    }

    // APIリストの順番を入れ替え
    apis.push(apis.shift());
  }

  throw new Error("全てのAPIがタイムアウトしました");
}

// JSONかどうかをチェックする関数
function isJson(data) {
  try {
    return typeof data === 'object' && data !== null;
  } catch (error) {
    return false;
  }
}

// 動画データを取得する関数
async function getData(videoId) {
  try {
    const data = await apirequest(`api/v1/videos/${encodeURIComponent(videoId)}`);
    
    return {
      recommendedVideos: data.recommendedVideos.map((video) => ({
        id: video.videoId,
        title: video.title,
        authorId: video.authorId,
        author: video.author
      })),
      formatStreams: data.formatStreams.reverse().slice(0, 2).map((stream) => stream.url),
      description: data.descriptionHtml.replace("\n", "<br>"),
      title: data.title,
      authorId: data.authorId,
      author: data.author,
      authorThumbnail: data.authorThumbnails[data.authorThumbnails.length - 1].url
    };
  } catch (error) {
    console.error("動画データの取得に失敗しました:", error);
  }
}

// 使用例
(async () => {
  const videoId = 'sample_video_id';
  const videoData = await getData(videoId);
  console.log(videoData);
})();
