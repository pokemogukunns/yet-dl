import urllib.parse
import json
import requests  # requestsライブラリを使用して外部APIからデータを取得

def get_data(videoid):
    global logs

    # APIリクエストURL（複数のAPIを使う場合はAPIリストを定義し、ランダムに選択してリクエストする）
    apis = [
        "https://youtube.privacyplz.org/",
        "https://inv.nadeko.net/"
    ]
    
    # ランダムにAPIを選択
    api_url = apis[0]  # 最初のAPIを使う場合。別途ランダム選択も可能。

    try:
        # YouTube動画の情報をAPIから取得
        response = requests.get(f"{api_url}/api/v1/videos/{urllib.parse.quote(videoid)}")
        
        # エラーチェック
        if response.status_code != 200:
            raise Exception(f"Failed to fetch data from {api_url}, status code: {response.status_code}")
        
        # JSONデータに変換
        t = response.json()

        # 必要なデータを整形
        recommended_videos = [
            {
                "id": i["videoId"],
                "title": i["title"],
                "authorId": i["authorId"],
                "author": i["author"]
            }
            for i in t.get("recommendedVideos", [])
        ]
        
        # ストリームURLを逆順にして上位2つを取得
        stream_urls = list(reversed([i["url"] for i in t.get("formatStreams", [])]))[:2]

        # 返すデータ
        result = {
            "recommendedVideos": recommended_videos,
            "streamUrls": stream_urls,
            "description": t.get("descriptionHtml", "").replace("\n", "<br>"),
            "title": t.get("title"),
            "authorId": t.get("authorId"),
            "author": t.get("author"),
            "authorThumbnail": t["authorThumbnails"][-1]["url"] if t.get("authorThumbnails") else None
        }

        return result

    except Exception as e:
        logs.append(str(e))  # エラーログを記録
        return {"error": str(e)}
