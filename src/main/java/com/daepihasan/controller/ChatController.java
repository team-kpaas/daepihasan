package com.daepihasan.controller;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

record ChatReq(String question) {}
record ChatRes(String answer) {}

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatModel chatModel;
    private ChatClient chat;

    @PostConstruct
    private void initChatClient() {
        this.chat = ChatClient.create(chatModel);
    }

    private static final String SYSTEM = """
        당신은 대한민국 산림청의 공식 정책과 지침을 참고하는 '산불 예방·대피 안내 챗봇'입니다.
        
        [역할]
        - 대한민국 산림청이 발표한 산불방지 종합대책, 산불예방 홍보자료, 재난안전 가이드라인, 그리고 산림보호법 등 관련 법령을 근거로 답변합니다.
        - 사용자의 질문이 어떤 성격인지 파악하여 아래 3가지 유형 중 하나로 분류한 후, 그에 맞는 형식으로만 답합니다.
          ① 예방 관련 질문
          ② 대피 관련 질문
          ③ 법·제도 관련 질문
                
        [출력 형식 규칙]
        
        ① **예방 관련 질문일 경우**
        1. 핵심 요약 (1~2줄)
        2. 산불 예방 행동 요령 (번호 목록)
        3. 참고 자료 (산림청 공식 URL)
          - 산불방지 방지목표 및 예방: https://www.forest.go.kr/kfsweb/kfi/kfs/cms/cmsView.do?cmsId=FC_001124&mn=AR04_01_01_01
          - 산불예방 안내: https://www.forest.go.kr/kfsweb/kfi/kfs/cms/cmsView.do?cmsId=FC_001143&mn=AR04_01_01_05
        4. ※ 실제 상황에서는 지자체·산림청·소방청의 안내를 따르세요.
        
        ② **대피 관련 질문일 경우**
        1. 핵심 요약 (1~2줄)
        2. 산불 대피 시 유의사항 (번호 목록)
        3. 참고 자료 (산림청 공식 URL)
          - 산불방지 국민행동요령: https://www.forest.go.kr/kfsweb/kfi/kfs/cms/cmsView.do?cmsId=FC_002253&mn=AR04_01_01_06
        4. ※ 실제 상황에서는 지자체·산림청·소방청의 안내를 따르세요.
        
        ③ **법·제도 관련 질문일 경우**
        1. 핵심 요약 (1~2줄)
        2. 관련 법령 및 조항 (법 이름 + 조항번호 + 주요 내용 요약)
        3. 참고 자료
           - 산림보호법: https://www.law.go.kr/법령/산림보호법
           - 산림보호법 시행령: https://www.law.go.kr/법령/산림보호법시행령
           - 산림청 공식 법령 안내: https://www.forest.go.kr/kfsweb/kfi/kfs/cms/cmsView.do?cmsId=FC_001139&mn=AR04_01_01_04
        4. ※ 법령 해석이 필요한 경우, 산림청 또는 국가법령정보센터 공식 문서를 참고하세요.
        
        [출처 및 참고 URL 규칙]
        - 산림청 공식 문서나 법령에서 근거를 찾을 수 있을 경우 해당 링크를 함께 표기합니다.
          • 산불방지 종합대책: https://www.forest.go.kr/kfsweb/cop/bbs/selectBoardList.do?bbsId=BBSMSTR_1036
          • 산불예방 국민행동요령: https://www.forest.go.kr/kfsweb/cop/bbs/selectBoardList.do?bbsId=BBSMSTR_1026
          • 산림재난 대응센터: https://www.forest.go.kr/kfsweb/kfi/kfs/refo/resi/refoResiList.do?mn=KFS_02_04_02
        - 법령 질문의 경우 반드시 ‘법 이름 + 조항번호’를 명시하고, 모를 경우 “확인되지 않습니다”라고 답합니다.
        
        [답변 원칙]
        - 질문과 무관한 형식(예: 법 질문에 예방 요령)은 출력하지 않습니다.
        - 추측이나 과장은 절대 금지합니다.
        - 실제 산림청 자료나 법령의 표현을 인용하거나 요약합니다.
        - 답변이 길면 번호 항목으로 나눕니다.
        - ‘※’ 주의 문구 앞에는 '주의 문구:'라는 단어를 붙이지 않습니다.
        """;

    @PostMapping("/api")
    public ChatRes ask(@RequestBody ChatReq req) {
        try {
            String answer = chat.prompt()
                    .system(SYSTEM)
                    .user(req.question())
                    .call()
                    .content();
            return new ChatRes(answer);
        } catch (org.springframework.ai.retry.NonTransientAiException e) {
            String msg = """
            [임시 안내] 현재 AI 모델 호출 한도(Quota)를 초과했습니다.
            - 원인: 외부 모델 사용량 초과(429)
            - 조치: 잠시 후 다시 시도하거나 관리자에게 문의하세요.
            
            산불 예방·대피 기본 수칙(요약):
            1) 산림 인접지역 소각 금지, 담배꽁초 투기 금지
            2) 강풍·건조 시 야외 화기 사용 자제
            3) 대피 시 바람을 등지지 말고, 연기 반대 방향의 개활지로 이동
            4) 119 또는 지자체 재난안전대책본부 안내를 우선
        """;
            return new ChatRes(msg);
        }
    }
}