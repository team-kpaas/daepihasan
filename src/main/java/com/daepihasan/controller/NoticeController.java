package com.daepihasan.controller;


import com.daepihasan.dto.*;
import com.daepihasan.service.INoticeCategoryService;
import com.daepihasan.service.INoticeCommentService;
import com.daepihasan.service.INoticeLikeService;
import com.daepihasan.service.INoticeService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/notice")
public class NoticeController {

    private final INoticeService noticeService;
    private final INoticeCategoryService categoryService;
    private final INoticeCommentService commentService;
    private final INoticeLikeService likeService;

    /* ---------------------- 페이지(뷰) ---------------------- */

    /** 목록 */
    @GetMapping({"", "/", "/list"})
    public String list(@ModelAttribute NoticeSearchDTO pDTO, Model model) throws Exception {
        if (pDTO.getPage() == null || pDTO.getPage() < 1) pDTO.setPage(1);
        if (pDTO.getSize() == null || pDTO.getSize() < 1) pDTO.setSize(10);

        log.info("[NOTICE][LIST] page={}, size={}, filters={}", pDTO.getPage(), pDTO.getSize(), pDTO);

        List<NoticeDTO> list = noticeService.getNoticeList(pDTO);
        int total = noticeService.countNotices(pDTO); // 서비스/매퍼 메서드명 일치 필수
        int totalPages = Math.max(1, (int) Math.ceil((double) total / pDTO.getSize()));

        log.debug("[NOTICE][LIST] resultCount={}, total={}, totalPages={}", list.size(), total, totalPages);

        model.addAttribute("list", list);
        model.addAttribute("total", total);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("page", pDTO.getPage());
        model.addAttribute("size", pDTO.getSize());
        model.addAttribute("search", pDTO);
        // null 대신 빈 DTO 전달 권장
        model.addAttribute("categoryList", categoryService.getCategoryList(new NoticeCategoryDTO()));

        return "notice/list";
    }

    /** 상세 */
    @GetMapping("/{id}")
    public String detail(@PathVariable("id") Integer id, Model model, HttpSession session) throws Exception {
        NoticeDTO item = noticeService.getNoticeDetail(NoticeDTO.builder().noticeSeq(id).build());
        bumpReadCountOncePerSession(id, session);
        String uid = (String) session.getAttribute("SS_USER_ID");           // 👈 String
        NoticeLikeDTO likeQ = NoticeLikeDTO.builder()
                .noticeSeq(id)
                .userId(uid)                             // 👈 String 그대로
                .build();

        boolean liked = likeService.hasUserLiked(likeQ);
        int likeCount = likeService.getLikeCount(likeQ);

        model.addAttribute("item", item);
        model.addAttribute("liked", liked);
        model.addAttribute("likeCount", likeCount);
        return "notice/detail";
    }

    /** 작성 폼 */
    @GetMapping("/write")
    public String writeForm(Model model) throws Exception {
        log.info("[NOTICE][WRITE_FORM]");
        model.addAttribute("categoryList", categoryService.getCategoryList(new NoticeCategoryDTO()));
        return "notice/write";
    }

    /** 작성 처리 */
    @PostMapping("/write")
    public String create(@ModelAttribute NoticeDTO pDTO, HttpSession session) throws Exception {
        final String uid = (String) session.getAttribute("SS_USER_ID");
        log.info("[NOTICE][CREATE] uid={}, payload(title={}, categoryId={})",
                uid, pDTO.getTitle(), pDTO.getCategoryId());

        // 감사정보/작성자 기록 (스키마/DTO 타입 확인)
        pDTO.setRegId(uid);
        pDTO.setUserId(uid);

        int r = noticeService.createNotice(pDTO);
        log.debug("[NOTICE][CREATE] result={}", r);
        return "redirect:/notice/list";
    }

    /** 수정 폼 */
    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable("id") Integer id, Model model) throws Exception {
        log.info("[NOTICE][EDIT_FORM] id={}", id);
        model.addAttribute("item",
                noticeService.getNoticeDetail(NoticeDTO.builder().noticeSeq(id).build()));
        model.addAttribute("categoryList", categoryService.getCategoryList(new NoticeCategoryDTO()));
        return "notice/update";
    }

    /** 수정 처리 */
    @PostMapping("/{id}/edit")
    public String update(@PathVariable("id") Integer id,
                         @ModelAttribute NoticeDTO pDTO,
                         HttpSession session) throws Exception {
        final String uid = (String) session.getAttribute("SS_USER_ID");
        pDTO.setNoticeSeq(id);
        pDTO.setChgId(uid);

        log.info("[NOTICE][UPDATE] id={}, uid={}, payload(title={}, categoryId={})",
                id, uid, pDTO.getTitle(), pDTO.getCategoryId());

        int r = noticeService.updateNotice(pDTO);
        log.debug("[NOTICE][UPDATE] result={}", r);
        return "redirect:/notice/" + id;
    }

    /** 삭제(소프트) */
    @PostMapping("/{id}/delete")
    public String delete(@PathVariable Integer id,
                         HttpSession session,
                         RedirectAttributes ra) throws Exception {
        String userId = (String) session.getAttribute("SS_USER_ID"); // or SecurityContext
        int r = noticeService.softDeleteNotice(
                NoticeDTO.builder()
                        .noticeSeq(id)
                        .chgId(userId) // ← 추가
                        .build()
        );
        ra.addFlashAttribute("msg", r > 0 ? "삭제되었습니다." : "삭제할 수 없습니다.");
        return "redirect:/notice/list";
    }

    /* ---------------------- 좋아요 API ---------------------- */

    // 좋아요
    @PostMapping(value = "/{id}/like", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> like(@PathVariable("id") Integer id, HttpSession session) throws Exception {
        String userId = (String) session.getAttribute("SS_USER_ID");        // 👈 String
        NoticeLikeDTO p = NoticeLikeDTO.builder()
                .noticeSeq(id)
                .userId(userId)                          // 👈 String 그대로
                .build();
        int r = likeService.like(p);
        return ResponseEntity.ok(Map.of(
                "liked", r > 0,
                "count", likeService.getLikeCount(p)
        ));
    }

    // 좋아요 취소
    @DeleteMapping(value = "/{id}/like", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> unlike(@PathVariable("id") Integer id, HttpSession session) throws Exception {
        String userId = (String) session.getAttribute("SS_USER_ID");        // 👈 String
        NoticeLikeDTO p = NoticeLikeDTO.builder()
                .noticeSeq(id)
                .userId(userId)                          // 👈 String 그대로
                .build();
        int r = likeService.unlike(p);
        return ResponseEntity.ok(Map.of(
                "liked", false,
                "count", likeService.getLikeCount(p)
        ));
    }

    @GetMapping(value = "/{id}/likes/count", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> likeCount(@PathVariable("id") Integer id) throws Exception {
        int cnt = likeService.getLikeCount(NoticeLikeDTO.builder().noticeSeq(id).build());
        log.debug("[LIKE][COUNT] noticeId={}, count={}", id, cnt);
        return ResponseEntity.ok(Map.of("count", cnt));
    }

    // 내가 좋아요 했는지
    @GetMapping(value = "/{id}/likes/me", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> likedMe(@PathVariable("id") Integer id, HttpSession session) throws Exception {
        String userId = (String) session.getAttribute("SS_USER_ID");        // 👈 String
        boolean liked = likeService.hasUserLiked(
                NoticeLikeDTO.builder().noticeSeq(id).userId(userId).build()
        );
        return ResponseEntity.ok(Map.of("liked", liked));
    }

    /* ---------------------- 댓글 API ---------------------- */

    @GetMapping(value = "/{id}/comments", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> commentList(@PathVariable("id") Integer id,
                                         @RequestParam(defaultValue = "1") Integer page,
                                         @RequestParam(defaultValue = "50") Integer size) throws Exception {
        log.info("[COMMENT][LIST] noticeId={}, page={}, size={}", id, page, size);

        NoticeCommentSearchDTO q = NoticeCommentSearchDTO.builder()
                .noticeSeq(id).page(page).size(size).build();
        List<NoticeCommentDTO> list = commentService.getCommentsByNotice(q);

        log.debug("[COMMENT][LIST] resultCount={}", list.size());
        return ResponseEntity.ok(list);
    }

    @PostMapping(value = "/{id}/comments", consumes = "application/json", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> addComment(@PathVariable("id") Integer id,
                                        @RequestBody NoticeCommentDTO pDTO,
                                        HttpSession session) throws Exception {
        final String uid = (String) session.getAttribute("SS_USER_ID");
        pDTO.setNoticeSeq(id);
        pDTO.setUserId(uid);

        log.info("[COMMENT][ADD] noticeId={}, uid={}, contentLen={}",
                id, uid, pDTO.getContents() == null ? 0 : pDTO.getContents().length());

        int r = commentService.addComment(pDTO);
        log.debug("[COMMENT][ADD] result={}", r);
        return ResponseEntity.ok(Map.of("ok", r > 0));
    }

    @PutMapping(value = "/{id}/comments/{commentId}", consumes = "application/json", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> updateComment(@PathVariable("id") Integer id,
                                           @PathVariable("commentId") Integer commentId,
                                           @RequestBody NoticeCommentDTO pDTO,
                                           HttpSession session) throws Exception {
        final String uid = (String) session.getAttribute("SS_USER_ID");
        pDTO.setNoticeSeq(id);
        pDTO.setId(commentId);
        pDTO.setUserId(uid);

        log.info("[COMMENT][UPDATE] noticeId={}, commentId={}, uid={}, contentLen={}",
                id, commentId, uid, pDTO.getContents() == null ? 0 : pDTO.getContents().length());

        int r = commentService.updateComment(pDTO);
        log.debug("[COMMENT][UPDATE] result={}", r);
        return ResponseEntity.ok(Map.of("ok", r > 0));
    }

    @DeleteMapping(value = "/{id}/comments/{commentId}", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> deleteComment(@PathVariable("id") Integer id,
                                           @PathVariable("commentId") Integer commentId,
                                           HttpSession session) throws Exception {
        final String uid = (String) session.getAttribute("SS_USER_ID");
        NoticeCommentDTO pDTO = NoticeCommentDTO.builder()
                .noticeSeq(id).id(commentId).userId(uid).build();

        log.info("[COMMENT][DELETE] noticeId={}, commentId={}, uid={}", id, commentId, uid);

        int r = commentService.softDeleteComment(pDTO);
        log.debug("[COMMENT][DELETE] result={}", r);
        return ResponseEntity.ok(Map.of("ok", r > 0));
    }

    private void bumpReadCountOncePerSession(Integer noticeId, HttpSession session) throws Exception {
        final String KEY = "VIEWED_NOTICE_" + noticeId;
        Object seen = session.getAttribute(KEY);
        if (seen == null) {
            noticeService.increaseReadCount(NoticeDTO.builder().noticeSeq(noticeId).build());
            session.setAttribute(KEY, Boolean.TRUE);
        }
    }

}