const fetch = require('node-fetch');

// YouTube Data APIキーを設定
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY';  // あなたのAPIキーを入力

module.exports = async (req, res) => {
  const { youtubeUrl } = req.query;

  if (!youtubeUrl) {
    return res.status(400).json({ error: 'YouTube URL is required' });
  }

  // YouTube URLから動画IDを抽出
  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  // YouTube Data APIを使って動画情報を取得
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics`;
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const videoInfo = data.items[0];
    const videoDetails = {
      title: videoInfo.snippet.title,
      description: videoInfo.snippet.description,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: videoInfo.snippet.thumbnails.high.url,
      duration: videoInfo.contentDetails.duration, // ISO 8601形式での動画の長さ
      views: videoInfo.statistics.viewCount,
      // ストリームURL（yt-dlpなどの外部ツールを使用しない代わりに、仮のURLを提供）
      streamUrl: `https://www.youtube.com/watch?v=${videoId}`  // ここでは仮のURLとしてYouTubeの視聴ページURLを返します
    };

    return res.status(200).json(videoDetails);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch video details' });
  }
};

// YouTube URLから動画IDを抽出する関数
function extractVideoId(url) {
  const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S+?v=|(?:watch\?v=|[\w-]{11}))/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
