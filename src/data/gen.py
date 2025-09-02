import json
import os
import random

import genanki
from gtts import gTTS

# 加载 JSON 文件（包含所有 N5 单词）
with open("vocabulary.json", "r", encoding="utf-8") as f:
    vocab_list = json.load(f)

# 使用全部词汇
all_vocab = vocab_list  

# 创建模型（双向卡片：日语→中文 + 中文→日语）
model_id = random.randrange(1 << 30, 1 << 31)
model = genanki.Model(
    model_id,
    'JLPT_N5_Model',
    fields=[
        {'name': 'Japanese'},
        {'name': 'Reading'},
        {'name': 'English'},
        {'name': 'PartOfSpeech'},
        {'name': 'ExampleJP'},
        {'name': 'ExampleCN'},
        {'name': 'JLPT'},
        {'name': 'Audio'}
    ],
    templates=[
        # 卡片 1: 日语 → 中文
        {
            'name': 'Card 1',
            'qfmt': '''
            <div class="card-front">
              <div class="japanese">{{Japanese}}</div>
              <div class="reading">{{Reading}}</div>
              <div class="audio">{{Audio}}</div>
            </div>
            ''',
            'afmt': '''
            {{FrontSide}}<hr>
            <div class="card-back">
              <div class="meaning"><b>释义:</b> {{English}}</div>
              <div class="pos"><b>词性:</b> {{PartOfSpeech}}</div>
              <div class="example">
                <b>例句:</b> <span class="jp">{{ExampleJP}}</span><br>
                <span class="cn">→ {{ExampleCN}}</span>
              </div>
              <div class="jlpt">JLPT: <span class="badge">{{JLPT}}</span></div>
            </div>
            '''
        },
        # 卡片 2: 中文 → 日语
        {
            'name': 'Card 2',
            'qfmt': '''
            <div class="card-front">
              <div class="meaning"><b>释义:</b> {{English}}</div>
            </div>
            ''',
            'afmt': '''
            {{FrontSide}}<hr>
            <div class="card-back">
              <div class="japanese">{{Japanese}}</div>
              <div class="reading">{{Reading}}</div>
              <div class="pos"><b>词性:</b> {{PartOfSpeech}}</div>
              <div class="example">
                <b>例句:</b> <span class="jp">{{ExampleJP}}</span><br>
                <span class="cn">→ {{ExampleCN}}</span>
              </div>
              <div class="jlpt">JLPT: <span class="badge">{{JLPT}}</span></div>
              <div class="audio">{{Audio}}</div>
            </div>
            '''
        }
    ]
)

# 创建牌组
deck_id = random.randrange(1 << 30, 1 << 31)
deck = genanki.Deck(deck_id, "JLPT_N5_Vocab")

# 生成音频文件夹
os.makedirs("tts", exist_ok=True)
media_files = []

for i, vocab in enumerate(all_vocab):
    jp_word = vocab.get("japanese", "")
    reading = vocab.get("reading", "")
    english = vocab.get("english", "")
    part = vocab.get("partOfSpeech", "")
    jlpt = vocab.get("jlptLevel", "")
    example_jp = vocab.get("exampleSentenceJapanese", "")
    example_cn = vocab.get("exampleSentenceEnglish", "")

    # 生成 TTS（断点续跑）
    tts_filename = f"tts/word_{i}.mp3"
    if not os.path.exists(tts_filename):  
        try:
            tts = gTTS(jp_word, lang="ja")
            tts.save(tts_filename)
            print(f"✅ 生成音频: {jp_word}")
        except Exception as e:
            print(f"⚠️ 跳过 {jp_word}, 生成失败: {e}")
            continue
    else:
        print(f"⏩ 已存在音频，跳过: {jp_word}")

    media_files.append(tts_filename)

    note = genanki.Note(
        model=model,
        fields=[
            jp_word,
            reading,
            english,
            part,
            example_jp,
            example_cn,
            jlpt,
            f"[sound:word_{i}.mp3]"
        ]
    )
    deck.add_note(note)

# 输出完整 APKG
genanki.Package(deck, media_files).write_to_file("JLPT_N5_Vocab_All.apkg")
print("🎉 完成! 已生成 JLPT_N5_Vocab_All.apkg")
