package com.tickx.controller;

import com.tickx.service.TicketmasterSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/sync")
@RequiredArgsConstructor
public class SyncController {

    private final TicketmasterSyncService syncService;

    @PostMapping
    public ResponseEntity<TicketmasterSyncService.SyncResult> triggerSync() {
        log.info("Manual sync triggered");
        TicketmasterSyncService.SyncResult result = syncService.sync();

        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(500).body(result);
        }
    }
}
