;; Risk Scoring Contract
;; Identifies suspicious activity based on risk factors

(define-data-var admin principal tx-sender)

;; Map to store entity risk scores
(define-map entity-risk-scores principal
  {
    base-score: uint,
    activity-score: uint,
    total-score: uint,
    last-updated: uint
  }
)

;; Risk thresholds
(define-constant low-risk-threshold u30)
(define-constant medium-risk-threshold u70)

;; Public function to set base risk score for an entity
(define-public (set-base-risk (entity principal) (score uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u100))
    (asserts! (<= score u100) (err u301))

    (match (map-get? entity-risk-scores entity)
      existing-data
      (let
        (
          (activity-score (get activity-score existing-data))
          (total-score (+ score activity-score))
        )
        (map-set entity-risk-scores entity
          {
            base-score: score,
            activity-score: activity-score,
            total-score: total-score,
            last-updated: block-height
          }
        )
      )
      (map-set entity-risk-scores entity
        {
          base-score: score,
          activity-score: u0,
          total-score: score,
          last-updated: block-height
        }
      )
    )
    (ok true)
  )
)

;; Public function to update activity risk score
(define-public (update-activity-score (entity principal) (score uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u100))
    (asserts! (<= score u100) (err u301))

    (match (map-get? entity-risk-scores entity)
      existing-data
      (let
        (
          (base-score (get base-score existing-data))
          (total-score (+ base-score score))
        )
        (map-set entity-risk-scores entity
          {
            base-score: base-score,
            activity-score: score,
            total-score: total-score,
            last-updated: block-height
          }
        )
        (ok true)
      )
      (err u302)
    )
  )
)

;; Read-only function to get risk category
(define-read-only (get-risk-category (entity principal))
  (match (map-get? entity-risk-scores entity)
    score-data
    (let ((total-score (get total-score score-data)))
      (ok (if (<= total-score low-risk-threshold)
            "low"
            (if (<= total-score medium-risk-threshold)
              "medium"
              "high"
            )
          ))
    )
    (err u302)
  )
)

;; Read-only function to get entity risk details
(define-read-only (get-risk-details (entity principal))
  (map-get? entity-risk-scores entity)
)

;; Function to transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u100))
    (var-set admin new-admin)
    (ok true)
  )
)
