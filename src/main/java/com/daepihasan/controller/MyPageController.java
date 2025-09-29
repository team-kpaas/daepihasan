package com.daepihasan.controller;

import com.daepihasan.dto.MsgDTO;
import com.daepihasan.dto.UserInfoDTO;
import com.daepihasan.service.IUserInfoService;
import com.daepihasan.util.CmmUtil;
import com.daepihasan.util.EncryptUtil;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Controller
@RequestMapping("/user")
public class MyPageController {

    private final IUserInfoService userInfoService;

    // 내 기본 정보 조회 (이메일은 복호화)
    @GetMapping("/myPage")
    public String myPage(HttpSession session, ModelMap model) {
        log.info("{}.user/myPage Start!", this.getClass().getName());

        return "user/myPage";
    }

    @ResponseBody
    @GetMapping("/me")
    public MsgDTO me(HttpSession session) {
        log.info("{}.user/me Start!", this.getClass().getName());

        MsgDTO msgDTO = new MsgDTO();
        String userId = CmmUtil.nvl((String) session.getAttribute("SS_USER_ID"));
        log.info("userId: {}", userId);

        if (userId.isEmpty()) {
            msgDTO.setResult(0);
            msgDTO.setMsg("로그인이 필요합니다.");
            return msgDTO;
        }

        UserInfoDTO pDTO = new UserInfoDTO();
        pDTO.setUserId(userId);

        try {
            UserInfoDTO rDTO = userInfoService.getUserDetail(pDTO);
            if (rDTO == null || CmmUtil.nvl(rDTO.getUserId()).isEmpty()) {
                msgDTO.setResult(0);
                msgDTO.setMsg("회원 정보를 찾을 수 없습니다.");
                return msgDTO;
            }

            log.info("rDTO : {}", rDTO);

            msgDTO.setResult(1);
            msgDTO.setData(rDTO);
        } catch (Exception e) {
            log.error("me() error: {}", e.getMessage(), e);
            msgDTO.setResult(0);
            msgDTO.setMsg("조회 중 오류가 발생했습니다.");
        }

        log.info("{}.user/me End!", this.getClass().getName());
        return msgDTO;
    }

    // 비밀번호 변경
    @ResponseBody
    @PostMapping("/me/password")
    public MsgDTO changePassword(@RequestParam String currentPw,
                                 @RequestParam String newPw,
                                 HttpSession session) throws Exception {

        MsgDTO m = new MsgDTO();
        String userId = CmmUtil.nvl((String) session.getAttribute("SS_USER_ID"));
        if (userId.isEmpty()) {
            m.setResult(0); m.setMsg("로그인이 필요합니다."); return m;
        }
        // currentPw, newPw 는 이미 클라이언트에서 해시하지 않았다면 여기서 해시 필요(정책에 맞게)
        UserInfoDTO chk = new UserInfoDTO();
        chk.setUserId(userId);
        chk.setPassword(currentPw);
        int confirm = userInfoService.confirmPassword(chk);
        if (confirm != 1) {
            m.setResult(5); m.setMsg("현재 비밀번호가 일치하지 않습니다.");
            return m;
        }
        UserInfoDTO upd = new UserInfoDTO();
        upd.setUserId(userId);
        upd.setPassword(newPw);
        int suc = userInfoService.newPasswordProc(upd);
        m.setResult(suc == 1 ? 1 : 0);
        m.setMsg(suc == 1 ? "비밀번호를 변경했습니다." : "변경 실패");
        return m;
    }

    // 주소 변경
    @ResponseBody
    @PostMapping("/me/address")
    public MsgDTO changeAddress(@RequestParam String addr1,
                                @RequestParam String addr2,
                                HttpSession session) throws Exception {
        MsgDTO m = new MsgDTO();
        String userId = CmmUtil.nvl((String) session.getAttribute("SS_USER_ID"));
        if (userId.isEmpty()) { m.setResult(0); m.setMsg("로그인이 필요합니다."); return m; }
        UserInfoDTO u = new UserInfoDTO();
        u.setUserId(userId);
        u.setAddr1(addr1);
        u.setAddr2(addr2);
        int r = userInfoService.updateAddress(u);
        m.setResult(r == 1 ? 1 : 0);
        m.setMsg(r == 1 ? "주소를 수정했습니다." : "수정 실패");
        return m;
    }

    // 내가 작성한 게시글 (간단 페이징 예시)
    @ResponseBody
    @GetMapping("/me/posts")
    public Map<String,Object> myPosts(@RequestParam(defaultValue = "1") int page,
                                      @RequestParam(defaultValue = "10") int size,
                                      HttpSession session) {
        String userId = CmmUtil.nvl((String) session.getAttribute("SS_USER_ID"));
        // 실제 구현: boardService.findMyPosts(userId, page, size)
        // 여기서는 목업 데이터
        return Map.of(
                "result", 1,
                "page", page,
                "size", size,
                "total", 0,
                "data", java.util.List.of()
        );
    }
}
