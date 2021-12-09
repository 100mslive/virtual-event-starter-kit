import { selectLocalPeer, selectPeersByRole } from "@100mslive/hms-video-store";
import { ExitIcon } from "@100mslive/react-icons";
import { useHMSActions, useHMSStore } from "@100mslive/react-sdk";
import UsersIcon from "@components/icons/icon-users";
import { useRouter } from "next/router";
import React from "react";
import s from "./index.module.css";

const Header = () => {
  const router = useRouter();
  const peers = useHMSStore(selectPeersByRole("viewer"));
  const actions = useHMSActions();
  const stagePeers = useHMSStore(selectPeersByRole("stage"));
  const icon = ["/rbdjr.jpg", "/stevejobs.jpg"];

  let stageNum = undefined;
  if (stagePeers.length - 2 > 0) {
    stageNum = stagePeers.length - 2;
  }
  let limit;
  limit = stagePeers.length > 2 ? 2 : stagePeers.length;

  const leave = () => {
    try {
      actions.leave().then(() => router.push("/"));
    } catch (error) {
      console.log(error);
    }
  };
  const localPeer = useHMSStore(selectLocalPeer);
  return (
    <div className={s["header"]}>
      <div className={s["meta"]}>
        {localPeer.roleName === "viewer" ? (
          <button onClick={leave} className={s["exit-btn"]}>
            <ExitIcon />
          </button>
        ) : null}
        <p className={s["title"]}>Demo Event</p>
        <span className={s["live-badge"]}>LIVE</span>
        <span className={s["time"]}>9:30 pm - 10:30 pm</span>
      </div>
      <div className={s["info-box"]}>
        <div>Speakers</div>
        {icon.slice(0, limit).map((p, i) => (
          <div className={s["info-box-image"]}>
            <img src={p} key={i + p} />
          </div>
        ))}
        <div>
          <p> {stageNum && " + " + (stagePeers.length - 2)} </p>
        </div>
        <div className={s["box"]}>
          <div className={s["participants-count"]}>
            <UsersIcon /> <span>{peers.length} watching</span>
          </div>
          {/* <button className={s['leave-btn']}>
          <LeaveIcon /> Leave
        </button> */}
        </div>
      </div>
    </div>
  );
};

export default Header;
