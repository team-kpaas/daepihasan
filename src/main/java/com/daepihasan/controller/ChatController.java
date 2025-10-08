package com.daepihasan.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

record ChatReq(String question) {}
record ChatRes(String answer) {}

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatClient chat;

    @Autowired
    public ChatController(ChatModel chatModel) {
        this.chat = ChatClient.create(chatModel);
    }

    private static final String SYSTEM = """
        역할: 당신은 대한민국 '산불 예방·대피' 안내 챗봇입니다.
        원칙:
          - 과장/추측 금지, 불확실하면 '확인 불가'라고 답하기
          - 위험행동 지시 금지(불길 접근, 임의 진입 등)
          - 단계형 안내(숫자 목록)로 간단명료하게
          - 답변 끝에 '주의: 실제 상황은 지자체/소방 안내를 우선' 고지
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